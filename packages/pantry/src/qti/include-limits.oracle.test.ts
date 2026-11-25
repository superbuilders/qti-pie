/**
 * The includes valid QTI writes that pantry cannot place, admitted and named by `UnplacedInclude`
 * (`#pantry/qti/overlay-queries/tests.ts`), and their invalid neighbours, still refused (spec
 * readings 1 and 115 to 118, lifted under the lead's J1 ruling). Each formerly refused case is
 * valid: an include whose href names an entry that is no document and that holds an `xi:fallback`
 * meets a resource error, and "When a resource error is encountered, the xi:include element is
 * replaced with the contents of the xi:fallback element" (XInclude 1.0 Second Edition §3.2, §4.2);
 * a fragment rooted at a kind the composition splits by context, and one placed under two nearest
 * interactions, are valid once merged, as XInclude's result "merges the source infoset with the
 * infosets of resources identified by URI references" (§4); an IDREF beside an external include
 * may name an ID the unfetched resource holds; and the content of an include outside its
 * `xi:fallback` "is not constrained by this specification and is ignored by the XInclude
 * processor" (§3.1). An application "must be able to ignore or remove the unsupported data" (QTI
 * 3.0 Conformance §3), so each is stored and served as not deliverable, never refused. The
 * neighbours are invalid: an include with no href (§3.1: "If the href attribute is absent when
 * parse="xml", the xpointer attribute must be present"), with or without a fallback, which stands
 * only for a resource error; a rules fragment in an item body, which no parent there admits
 * (reading 114); and two fallbacks (§3.1: "the appearance of more than one xi:fallback element
 * ... is a fatal error", reading 118).
 *
 * Oracle: the specification's text above, and a second implementation, the law oracle
 * (`#pantry/test/oracle.ts` `judge`), against the laws the import's rows break on the host
 * (`#pantry/test/gen/genetic/judge.ts` `judgeOne`): no disagreement, and each case's verdict the
 * one written here. "Include target" for an href naming an entry and `UnplacedInclude` are queries
 * the host leaves to the database, so each is restated over the import's rows
 * (`#pantry/test/placed-includes.ts`): the law breaks exactly where the case is refused under it,
 * and the causes are the ones written here.
 *
 * Bound: the five formerly refused shapes, one each, and five neighbours, the fallback's without
 * its fallback among them: 10 packages, exhausted.
 */
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { readProgram } from "#pantry/import/program.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { genomeOf } from "#pantry/test/gen/genetic/genome.ts";
import { judgeOne, shownDisagreement } from "#pantry/test/gen/genetic/judge.ts";
import { previewRowsOf } from "#pantry/test/host-judge.ts";
import type { LawName } from "#pantry/test/oracle.ts";
import { lawsOf } from "#pantry/test/oracle.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { breaksIncludeTarget, unplacedCausesOf } from "#pantry/test/placed-includes.ts";
import type { Cause } from "#pantry/test/placed-includes.ts";
import { asi, manifestOf } from "#pantry/test/probe.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";

/**
 * The oracle's law tables over the composed grammar.
 */
const laws = lawsOf(grammar);

/**
 * The cases of the box: the five formerly refused shapes, then the five neighbours.
 */
const names = [
  "fallback",
  "split root",
  "context",
  "external idref",
  "include content",
  "no document, no fallback",
  "no href",
  "no href, with fallback",
  "rules fragment in the body",
  "two fallbacks",
] as const;

/**
 * One case of the box.
 */
type CaseName = (typeof names)[number];

/**
 * What a case must give: admitted, with the causes of its unplaced includes, or refused under a
 * law both sides break.
 */
type Expected =
  | { readonly causes: readonly Cause[]; readonly kind: "admitted" }
  | { readonly kind: "refused"; readonly law: LawName };

/**
 * A one-pixel PNG, an entry that is no document.
 */
const png = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=",
  ),
  (character) => character.codePointAt(0) ?? 0,
);

/**
 * An item: a hottext response, a template `T`, and the given body.
 *
 * @param body - The item body's content.
 * @returns The item's text.
 */
const itemOf = (body: string): string =>
  `<qti-assessment-item xmlns="${asi}" xmlns:xi="http://www.w3.org/2001/XInclude" identifier="I" title="Item" time-dependent="false"><qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"/><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-template-declaration identifier="T" cardinality="single" base-type="identifier"/><qti-item-body>${body}</qti-item-body></qti-assessment-item>`;

/**
 * A hottext interaction bound to `RESPONSE`, holding its own hottext and the given content.
 *
 * @param content - The content after its hottext.
 * @returns The interaction's text.
 */
const hottextsWith = (content: string): string =>
  `<qti-hottext-interaction response-identifier="RESPONSE" max-choices="1"><p><qti-hottext identifier="H1">a</qti-hottext></p>${content}</qti-hottext-interaction>`;

/**
 * Write a package: the manifest, `item.xml` with the given body, listed with the given files, and
 * a fragment resource for each named fragment.
 *
 * @param spec - The package.
 * @param spec.body - The item body's content.
 * @param spec.files - Files listed by the item's resource alone, as no document, with their bytes.
 * @param spec.fragments - Fragments, each its own resource, by path.
 * @returns Its entries.
 */
const packageOf = ({
  body,
  files = {},
  fragments = {},
}: {
  readonly body: string;
  readonly files?: Readonly<Record<string, Uint8Array>>;
  readonly fragments?: Readonly<Record<string, string>>;
}): PackageEntries => {
  const text = new TextEncoder();
  const listed = Object.keys(files)
    .map((path) => `<file href="${path}"/>`)
    .join("");
  const resources = [
    `<resource identifier="R" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/>${listed}</resource>`,
    ...Object.keys(fragments).map(
      (path, at) =>
        `<resource identifier="F${String(at)}" type="imsqti_fragment_xmlv3p0" href="${path}"><file href="${path}"/></resource>`,
    ),
  ].join("");

  return new Map([
    ["imsmanifest.xml", text.encode(manifestOf(resources))],
    ["item.xml", text.encode(itemOf(body))],
    ...Object.entries(files),
    ...Object.entries(fragments).map(([path, fragment]) => [path, text.encode(fragment)] as const),
  ]);
};

/**
 * A fragment of one paragraph.
 */
const paragraph = `<p xmlns="${asi}">shared</p>`;

/**
 * Each case's package and its verdict.
 */
const cases: Readonly<
  Record<CaseName, { readonly expected: Expected; readonly files: PackageEntries }>
> = {
  context: {
    // Reading 117: placed inside the interaction first, its context, and outside after.
    expected: { causes: ["context"], kind: "admitted" },
    files: packageOf({
      body: `${hottextsWith('<xi:include href="f.xml"/>')}<xi:include href="f.xml"/>`,
      fragments: { "f.xml": paragraph },
    }),
  },
  "external idref": {
    // Reading 115: `far` names no ID of the item, and may name one of the unfetched resource.
    expected: { causes: ["external"], kind: "admitted" },
    files: packageOf({
      body: `<p aria-labelledby="far">x</p><xi:include href="https://example.org/f.xml"/>`,
    }),
  },
  fallback: {
    // Reading 115: a resource error, replaced by the fallback's contents.
    expected: { causes: ["fallback"], kind: "admitted" },
    files: packageOf({
      body: '<xi:include href="a.png"><xi:fallback><p>No picture.</p></xi:fallback></xi:include>',
      files: { "a.png": png },
    }),
  },
  "include content": {
    // Reading 118: a choice interaction with no response, ignored, outside the fallback.
    expected: { causes: [], kind: "admitted" },
    files: packageOf({
      body: '<xi:include href="f.xml"><qti-choice-interaction max-choices="1"/></xi:include>',
      fragments: { "f.xml": paragraph },
    }),
  },
  "no document, no fallback": {
    expected: { kind: "refused", law: "Include target" },
    files: packageOf({ body: '<xi:include href="a.png"/>', files: { "a.png": png } }),
  },
  "no href": {
    expected: { kind: "refused", law: "Include target" },
    files: packageOf({ body: "<xi:include/>" }),
  },
  "no href, with fallback": {
    expected: { kind: "refused", law: "Include target" },
    files: packageOf({ body: "<xi:include><xi:fallback><p>x</p></xi:fallback></xi:include>" }),
  },
  "rules fragment in the body": {
    expected: { kind: "refused", law: "Include root" },
    files: packageOf({
      body: '<xi:include href="r.xml"/>',
      fragments: {
        "r.xml": `<qti-response-condition xmlns="${asi}"><qti-response-if><qti-is-null><qti-variable identifier="RESPONSE"/></qti-is-null><qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">0</qti-base-value></qti-set-outcome-value></qti-response-if></qti-response-condition>`,
      },
    }),
  },
  "split root": {
    // Reading 116: a rubric's content body admits the rubric's template block alone.
    expected: { causes: ["root"], kind: "admitted" },
    files: packageOf({
      body: '<qti-rubric-block view="candidate" use="instructions"><qti-content-body><xi:include href="t.xml"/></qti-content-body></qti-rubric-block>',
      fragments: {
        "t.xml": `<qti-template-block xmlns="${asi}" template-identifier="T" show-hide="show" identifier="B"><qti-content-body><p>t</p></qti-content-body></qti-template-block>`,
      },
    }),
  },
  "two fallbacks": {
    // Reading 118: the content model holds at most one fallback, so the second follows nothing.
    expected: { kind: "refused", law: "N5 Follow" },
    files: packageOf({
      body: '<xi:include href="a.png"><xi:fallback><p>a</p></xi:fallback><xi:fallback><p>b</p></xi:fallback></xi:include>',
      files: { "a.png": png },
    }),
  },
};

layer(NodeServices.layer, { excludeTestServices: true })("an include pantry cannot place", (it) => {
  it.effect(
    "is admitted and named unplaced where valid QTI writes it, and refused where XInclude or the information model forbids it, on the import's rows as in the law oracle",
    (ctx) =>
      searched(
        ctx,
        Effect.gen(function* includeLimitRuns() {
          const directory = yield* scratchDirectory("include-limits-");
          const bench = { directory, grammar, laws };

          return yield* exhaust(
            {
              box: "the five formerly refused include shapes and their five invalid neighbours",
              caseHang: Duration.minutes(5),
              concurrency: 1,
              coverage: requiredInSpace<"admitted" | "refused">(["admitted", "refused"]),
              generator: element(names),
              literal: (name) => name,
              oracle: {
                kind: "specification",
                name: "XInclude 1.0 Second Edition §3.1, §3.2, §4 and §4.2, information model §9.4.1, QTI 3.0 Conformance §3; spec readings 115 to 118",
              },
              suite: "pantry/include-limits",
            },
            (name, c) =>
              Effect.gen(function* includeLimitCase() {
                const { expected, files } = cases[name];
                c.note(expected.kind);

                const judged = yield* judgeOne(yield* genomeOf(files), bench, names.indexOf(name));
                assert.deepStrictEqual(judged.disagreements.map(shownDisagreement), [], name);

                if (expected.kind === "refused") {
                  assert.include(judged.summary.oracle, expected.law, `${name}: the oracle`);
                } else {
                  assert.deepStrictEqual(
                    judged.summary,
                    { import: "built ", oracle: "laws " },
                    name,
                  );
                }

                if (expected.kind === "refused" && judged.summary.import.includes(expected.law)) {
                  return;
                }

                // The host leaves the rest to the database: "Include target" over an href that
                // names an entry, and `UnplacedInclude`, each a query restated over the rows.
                const dir = yield* scopedPackage(files);
                const rows = previewRowsOf((yield* readProgram(dir, nameOf(dir))).inputs);
                assert.strictEqual(
                  breaksIncludeTarget(rows),
                  expected.kind === "refused" && expected.law === "Include target",
                  `${name}: Include target over PlacedIncludePath, the import ${judged.summary.import}`,
                );
                assert.deepStrictEqual(
                  unplacedCausesOf(rows),
                  expected.kind === "admitted" ? expected.causes : [],
                  name,
                );
              }).pipe(Effect.scoped),
          );
        }).pipe(Effect.scoped),
      ),
  );
});
