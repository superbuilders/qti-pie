/**
 * A processing reference whose declaration holds none of the tables it reads is refused, and no row
 * stands for the table it lacks (AGENTS.md's Schema intent: a value that may be missing is a row of
 * its own relation, never a sentinel): a map response, a map response point or a lookup whose
 * declaration holds none of the tables its kind reads is refused by "Mapped response" or "Lookup
 * type", each placed reference read against its declaration's own tables
 * (`#pantry/qti/overlay-queries/declaration.ts`).
 *
 * Oracle: a second implementation, the law oracle (`#pantry/test/oracle.ts` `judge`), against the
 * laws the import's rows break on the host (`#pantry/test/gen/genetic/judge.ts` `judgeOne`): no
 * case shows a disagreement but a class a lane's open fix owns (`known`).
 *
 * Bound: an item's map response, map response point and lookup naming a declaration that holds
 * each of {@link heldTables}' five table states, a built-in variable or nothing, the lookup of an
 * integer or a float: 28 packages, exhausted.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, pipe } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { genomeOf } from "#pantry/test/gen/genetic/genome.ts";
import { judgeOne, recordsClassOf, shownDisagreement } from "#pantry/test/gen/genetic/judge.ts";
import type { Signature } from "#pantry/test/gen/genetic/judge.ts";
import { known } from "#pantry/test/gen/genetic/known.ts";
import { lawsOf } from "#pantry/test/oracle.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";

/**
 * The oracle's law tables over the composed grammar.
 */
const laws = lawsOf(grammar);

/**
 * The signatures of the disagreements a lane's open fix owns (`#pantry/test/gen/genetic/known.ts`),
 * which the box sets aside.
 */
const recorded: readonly Signature[] = known.map(({ signature }) => signature);

/**
 * The ASI namespace.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * The item resource type.
 */
const itemType = "imsqti_item_xmlv3p0";

/**
 * What a declaration an item's reference names holds: none of its tables, a mapping, an area
 * mapping, a match table or an interpolation table.
 */
const heldTables = [
  { held: "no table", text: "" },
  {
    held: "a mapping",
    text: `<qti-mapping default-value="0"><qti-map-entry map-key="A" mapped-value="1"/></qti-mapping>`,
  },
  {
    held: "an area mapping",
    text: `<qti-area-mapping default-value="0"><qti-area-map-entry shape="circle" coords="1,1,1" mapped-value="1"/></qti-area-mapping>`,
  },
  {
    held: "a match table",
    text: `<qti-match-table><qti-match-table-entry source-value="1" target-value="2"/></qti-match-table>`,
  },
  {
    held: "an interpolation table",
    text: `<qti-interpolation-table><qti-interpolation-table-entry source-value="1" target-value="2"/></qti-interpolation-table>`,
  },
] as const;

/**
 * The item references that claim a table: a map response, of a response's mapping; a map response
 * point, of a point response's area mapping; and a lookup, of an outcome's match or interpolation
 * table (§2.11.3.29, §2.11.3.30, §2.5.1.4), each with the declaration its `V` is.
 */
const claimers = [
  {
    declaration: `<qti-response-declaration identifier="V" cardinality="single" base-type="identifier">`,
    end: "</qti-response-declaration>",
    held: ["integer"],
    reader: "map response",
    rule: (name: string) =>
      `<qti-set-outcome-value identifier="SCORE"><qti-map-response identifier="${name}"/></qti-set-outcome-value>`,
  },
  {
    declaration: `<qti-response-declaration identifier="V" cardinality="single" base-type="point">`,
    end: "</qti-response-declaration>",
    held: ["integer"],
    reader: "map response point",
    rule: (name: string) =>
      `<qti-set-outcome-value identifier="SCORE"><qti-map-response-point identifier="${name}"/></qti-set-outcome-value>`,
  },
  {
    declaration: `<qti-outcome-declaration identifier="V" cardinality="single" base-type="float">`,
    end: "</qti-outcome-declaration>",
    held: ["integer", "float"],
    reader: "lookup",
    rule: (name: string, held: string) =>
      `<qti-lookup-outcome-value identifier="${name}"><qti-base-value base-type="${held}">1</qti-base-value></qti-lookup-outcome-value>`,
  },
] as const;

/**
 * What an item's claiming reference names: its declaration `V`, holding each table state; the
 * built-in `numAttempts`; or `NOPE`, which nothing declares.
 */
const targets = [
  ...heldTables.map(({ held, text }) => ({ name: "V", table: text, target: `V holding ${held}` })),
  { name: "numAttempts", table: "", target: "the built-in numAttempts" },
  { name: "NOPE", table: "", target: "nothing" },
] as const;

/**
 * Every case of the box: an item's table claim.
 */
const cases = claimers.flatMap((claimer) =>
  targets.flatMap((target) => claimer.held.map((held) => ({ claimer, held, target }))),
);

/**
 * A case of the box.
 */
type Case = (typeof cases)[number];

/**
 * Name a case.
 *
 * @param held - The case.
 * @returns Its name.
 */
const nameOf = (held: Case): string =>
  `a ${held.claimer.reader} naming ${held.target.target}${held.claimer.held.length > 1 ? `, of a ${held.held}` : ""}`;

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
 * Write an item: its declarations, a float outcome `SCORE` among them, and its response processing.
 *
 * @param declarations - Its declarations, responses first.
 * @param processing - Its response processing's rules, or none.
 * @returns The item's bytes.
 */
const itemOf = (declarations: string, processing: string): Uint8Array =>
  xml(
    `<qti-assessment-item xmlns="${asi}" identifier="item" title="Item" adaptive="false" time-dependent="false">${declarations}<qti-item-body><p>An item.</p></qti-item-body>${processing === "" ? "" : `<qti-response-processing>${processing}</qti-response-processing>`}</qti-assessment-item>`,
  );

/**
 * Write a case's package: an item whose response processing claims a table of what it names.
 *
 * @param held - The case.
 * @returns Its entries.
 */
const packageOf = ({ claimer, held, target }: Case): PackageEntries =>
  new Map([
    ["imsmanifest.xml", manifestOf([["item.xml", itemType]])],
    [
      "item.xml",
      itemOf(
        `${claimer.declaration}${target.table}${claimer.end}<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>`,
        claimer.rule(target.name, held),
      ),
    ],
  ]);

/**
 * A feature a case notes: what its claim names and by which reference.
 */
type Noted =
  | `claim ${(typeof claimers)[number]["reader"]}`
  | `target ${(typeof targets)[number]["target"]}`;

layer(NodeServices.layer, { excludeTestServices: true })(
  "a reference that claims no table",
  (it) => {
    it.effect(
      "holds no table claim, and is judged alike on the import's rows and in the law oracle",
      (ctx) =>
        searched(
          ctx,
          Effect.gen(function* tableClaimRuns() {
            const directory = yield* scratchDirectory("table-claims-");
            const bench = { directory, grammar, laws };

            return yield* exhaust(
              {
                box: "an item's map response, map response point or lookup naming a declaration that holds no table, a mapping, an area mapping, a match table or an interpolation table, a built-in, or nothing",
                caseHang: Duration.minutes(5),
                coverage: requiredInSpace<Noted>(
                  pipe(
                    claimers,
                    Arr.map(({ reader }): Noted => `claim ${reader}`),
                    Arr.appendAll(targets.map(({ target }): Noted => `target ${target}`)),
                  ),
                ),
                generator: int(0, cases.length - 1),
                literal: (at) => {
                  const held = cases[at];

                  return held === undefined ? String(at) : nameOf(held);
                },
                oracle: {
                  kind: "second-implementation",
                  name: "the law oracle against the laws the import's rows break on the host",
                },
                suite: "pantry/table-claims",
              },
              (at: number, c) =>
                Effect.gen(function* tableClaimCase() {
                  const held = cases[at];
                  assert.isDefined(held, `no case ${String(at)}`);
                  c.note(`claim ${held.claimer.reader}`);
                  c.note(`target ${held.target.target}`);

                  const judged = yield* judgeOne(yield* genomeOf(packageOf(held)), bench, at);

                  assert.deepStrictEqual(
                    judged.disagreements
                      .filter((disagreement) => !recordsClassOf(recorded, disagreement))
                      .map(shownDisagreement),
                    [],
                    `${nameOf(held)}: the oracle ${judged.summary.oracle}; the import ${judged.summary.import}`,
                  );
                }),
            );
          }).pipe(Effect.scoped),
        ),
    );
  },
);
