/**
 * A content reference resolves to a built-in variable of the item whose assembly it resolves in
 * (spec reading 29, the UP audit's A63) only where the built-in stands as a declaration kind the
 * reference may name: an item's built-ins are `numAttempts`, `duration`, `completionStatus` and
 * `QTI_CONTEXT` (information model §2.2.2, §2.2.2.1), so a feedback may name `completionStatus` and
 * no other, and "Feedback reference" refuses one that names `numAttempts`.
 *
 * The box is where the reference stands, in the item's own document or in a fragment it includes
 * (spec reading 117), by every built-in name, by each content reference and variable reference the
 * content makes ({@link references}): a feedback's outcome, a template's variable, a printed
 * variable's name and its `base`, and a portable custom interaction's context variable. Every
 * package declares none of the names, so each reference resolves to the item's built-in or to
 * nothing. Every case is judged by the law oracle and by the schema's own laws over the import's
 * rows (`#pantry/test/host-judge.ts`), and the laws each side breaks must be one set; the oracle's
 * verdict is held to the specification's table, written by hand.
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
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge, judgedLaws } from "#pantry/test/host-judge.ts";
import { judge as judgeOracle, lawsOf } from "#pantry/test/oracle.ts";
import { databaseJudgedLawNames } from "#pantry/test/law-namer.ts";
import { lawNameOf } from "#pantry/import/refusal.ts";
import { nameOf } from "#pantry/test/package-name.ts";

/**
 * The declaration kind each built-in variable of an item stands as, by hand from the information
 * model: its response variables `numAttempts` and `duration`, its outcome `completionStatus` and
 * its context `QTI_CONTEXT` (§2.2.2, §2.2.2.1, §2.2.2.3).
 */
const builtIns: ReadonlyMap<string, string> = new Map([
  ["QTI_CONTEXT", "context"],
  ["completionStatus", "outcome"],
  ["duration", "response"],
  ["numAttempts", "response"],
]);

/**
 * Every built-in name of an item.
 */
const names = ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"] as const;

/**
 * The declaration kinds each reference may name, by hand: a feedback's outcome (§5.49.1), a
 * template element's template variable (§5.145.1), a printed variable's outcome or template
 * variable, by its name and by its `base` (§7.30.6), and a context variable's context declaration
 * (reading 92).
 */
const namable = {
  context: ["context"],
  feedback: ["outcome"],
  printed: ["outcome", "template"],
  template: ["template"],
  variable: ["outcome", "template"],
} as const;

/**
 * The law each reference breaks where its name resolves to no variable it may name.
 */
const lawOf = {
  context: "Context variable reference",
  feedback: "Feedback reference",
  printed: "Printed variable reference",
  template: "Template reference",
  variable: "Printed variable reference",
} as const satisfies Readonly<Record<keyof typeof namable, string>>;

/**
 * The references an item's content makes in the box, in its own document and in a fragment it
 * includes alike.
 */
const references = [
  "context",
  "feedback",
  "printed",
  "template",
  "variable",
] as const satisfies readonly (keyof typeof namable)[];

/**
 * One case: where the reference stands, the name, and the reference.
 */
interface RootCase {
  readonly name: (typeof names)[number];
  readonly placement: "own" | "placed";
  readonly reference: keyof typeof namable;
}

/**
 * Every case of the references in one placement: the four names by the five references, 20; the
 * box's 40 over the two.
 *
 * @param placement - Where the references stand.
 * @returns The cases.
 */
const rootCasesAt =
  (placement: RootCase["placement"]): Gen<RootCase> =>
  (source) => ({
    name: source.draw(element(names)),
    placement,
    reference: source.draw(element(references)),
  });

/**
 * The parts of the box, each searched as its own case: the item's own and placed references.
 */
const parts = ["own", "placed"] as const satisfies readonly RootCase["placement"][];

/**
 * Decide, by the specification's table, whether a case's reference resolves: its name is a
 * built-in of the item that stands as a declaration kind the reference may name.
 *
 * @param drawn - The case.
 * @returns Whether it resolves.
 */
const resolves = (drawn: RootCase): boolean => {
  const kind = builtIns.get(drawn.name);

  return namable[drawn.reference].some((held) => held === kind);
};

/**
 * The QTI 3.0 namespace.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * Write a case's reference as content: a paragraph holding it, or, for a context variable, a
 * portable custom interaction binding the item's `WIDGET` that reads it. A printed variable's
 * `base` stands on one that prints the declared `SCORE`.
 *
 * @param drawn - The case.
 * @returns The content.
 */
const contentOf = (drawn: RootCase): string => {
  const { name } = drawn;
  const written = {
    context: `<qti-portable-custom-interaction response-identifier="WIDGET" custom-interaction-type-identifier="urn:example:portable" module="portable"><qti-interaction-markup><div>A widget.</div></qti-interaction-markup><qti-context-variable identifier="${name}"/></qti-portable-custom-interaction>`,
    feedback: `<p><qti-feedback-inline outcome-identifier="${name}" identifier="SHOWN" show-hide="show">Shown.</qti-feedback-inline></p>`,
    printed: `<p><qti-printed-variable identifier="${name}"/></p>`,
    template: `<p><qti-template-inline template-identifier="${name}" identifier="SHOWN" show-hide="show">Shown.</qti-template-inline></p>`,
    variable: `<p><qti-printed-variable identifier="SCORE" base="${name}"/></p>`,
  } as const;

  return written[drawn.reference];
};

/**
 * Write an XML document: its declaration, then its text.
 *
 * @param text - The document's root element.
 * @returns The document's bytes.
 */
const xml = (text: string): Uint8Array =>
  new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8"?>\n${text}\n`);

/**
 * Write a manifest listing each document once, under its resource type.
 *
 * @param resources - Each document's path and type.
 * @returns The manifest's bytes.
 */
const manifestOf = (resources: readonly (readonly [path: string, type: string])[]): Uint8Array =>
  xml(
    `<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources>${resources
      .map(
        ([path, type], at) =>
          `<resource identifier="R${String(at)}" type="${type}" href="${path}"><file href="${path}"/></resource>`,
      )
      .join("")}</resources></manifest>`,
  );

/**
 * Write an item that declares an outcome `SCORE` and a response `WIDGET`, its body the content
 * given.
 *
 * @param body - The body's content.
 * @returns The item's bytes.
 */
const itemOf = (body: string): Uint8Array =>
  xml(
    `<qti-assessment-item xmlns="${asi}" xmlns:xi="http://www.w3.org/2001/XInclude" identifier="item" title="Item" adaptive="false" time-dependent="false"><qti-response-declaration identifier="WIDGET" cardinality="single" base-type="string"/><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-item-body>${body}</qti-item-body></qti-assessment-item>`,
  );

/**
 * Build a case's package: an item that holds the reference in its body or in a fragment it
 * includes.
 *
 * @param drawn - The case.
 * @returns The package's entries.
 */
const packageOf = (drawn: RootCase): PackageEntries => {
  const content = contentOf(drawn);
  const item = "imsqti_item_xmlv3p0";

  return drawn.placement === "own"
    ? new Map([
        ["imsmanifest.xml", manifestOf([["item.xml", item]])],
        ["item.xml", itemOf(content)],
      ])
    : new Map([
        [
          "imsmanifest.xml",
          manifestOf([
            ["item.xml", item],
            ["fragment.xml", "imsqti_fragment_xmlv3p0"],
          ]),
        ],
        ["item.xml", itemOf('<xi:include href="fragment.xml"/>')],
        ["fragment.xml", xml(`<div xmlns="${asi}">${content}</div>`)],
      ]);
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
 * A situation the box must reach: the own and placed references, each resolved and unresolved.
 */
type Situation = `${RootCase["placement"]}, ${"resolved" | "unresolved"}`;

layer(NodeServices.layer, { excludeTestServices: true })(
  "a content reference to a built-in variable resolves only to a built-in of its item that it may name, the law oracle and the import's rows alike",
  (it) => {
    for (const placement of parts) {
      it.effect(`in an item, ${placement}`, (ctx) =>
        // Oracle: two implementations side by side, the law oracle's content references, which
        // read `BuiltInVariable` under the item's root, and the schema's laws over the import's
        // rows; and the specification's table of an item's built-ins, by hand. Bound: four names
        // by five own and five placed references: 40 packages, the own or the placed references
        // to a part.
        searched(
          ctx,
          exhaust(
            {
              box: `an item's ${placement} feedback, template, printed variable, printed variable base or context variable reference naming each built-in variable`,
              caseHang: Duration.minutes(1),
              concurrency: 1,
              coverage: requiredInSpace<Situation>([
                `${placement}, resolved`,
                `${placement}, unresolved`,
              ]),
              generator: rootCasesAt(placement),
              literal: Formatter.format,
              oracle: {
                kind: "second-implementation",
                name: "the law oracle's content references, the schema's laws over the import's rows, and the information model's built-ins of an item, by hand",
              },
              suite: `test/built-in-roots/item-${placement}`,
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
                  const program = yield* readProgram(dir, nameOf(dir));
                  const host = judge(previewRowsOf(program.inputs), hostLaws);
                  const broken = named(host.broken);
                  const unjudged = named(host.skipped);
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
                  const unresolved = oracle.has(lawOf[drawn.reference]);
                  c.note(`${drawn.placement}, ${unresolved ? "unresolved" : "resolved"}`);
                  // A context variable's identifier is also an IDREF of the item's context
                  // declarations (`ContextUniqueIDRefDType`), so its `QTI_CONTEXT` breaks Idref
                  // target beside resolving; the reference's own law is the table's alone.
                  assert.strictEqual(
                    unresolved,
                    !resolves(drawn),
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
    }
  },
);
