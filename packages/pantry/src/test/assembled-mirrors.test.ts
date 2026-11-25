/**
 * Every law of the schema the host can judge, held over the rows the import writes for the
 * every-relation package: each containment and each half of a `mirrors`, each key and each check,
 * read from the statements grizzle keeps (`#pantry/test/host-judge.ts` `judgedLaws`), over the
 * rows the import's write stores, grizzle's insertion preview of them, each selection and check
 * grizzle's evaluator's (`#pantry/test/host-judge.ts`). The law oracle accepts the package, so no
 * law may break, and the host judges every law it reads: none is skipped.
 *
 * Its assembled documents are a test, a section, two items with includes, a fragment of content
 * and a fragment of response rules (spec readings 5 and 117). A fragment an item's include splices
 * heads no assembly of its own (`#pantry/qti/tests.ts` `splicingParents`), so its IDREFs resolve
 * among the item's IDs alone. The heads are mirrored with the assemblies' roots both ways, and
 * every document of a test or a section is one some instance places, by rules over the queries
 * `HeadDocument` and `InstanceDocument` (`#pantry/qti/queries.ts`), which the host does not judge:
 * PostgreSQL alone does, the importer's every-relation package accepted and the unplaced cycles
 * refused.
 */
import type { Law, LawSide } from "@bjornpagen/grizzle";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { Effect, Formatter } from "effect";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { everyRelationPackage, scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge, judgedLaws } from "#pantry/test/host-judge.ts";
import { oracleVerdict } from "#pantry/test/oracle-verdict.ts";
import { nameOf } from "#pantry/test/package-name.ts";

/**
 * Whether a law side reads exactly `relation`'s fields `fields`, in order.
 *
 * @param side - The side.
 * @param relation - The relation.
 * @param fields - The fields.
 * @returns Whether it does.
 */
const readsFields = (side: LawSide, relation: string, fields: readonly string[]): boolean =>
  side.relation === relation &&
  side.terms.length === fields.length &&
  side.terms.every((term, at) => term.kind === "field" && term.field === fields[at]);

/**
 * The test that a law is the containment of some fields of a relation in as many of another.
 *
 * @param from - The source relation and its fields.
 * @param to - The target relation and its fields.
 * @returns The test.
 */
const containedAs =
  (from: readonly [string, readonly string[]], to: readonly [string, readonly string[]]) =>
  (law: Law): boolean =>
    law.kind === "contained" && readsFields(law.from, ...from) && readsFields(law.to, ...to);

/**
 * A document's key, `(package, path)`, the fields `Document`'s mirror with its document node pairs.
 */
const documentKey = ["package", "path"] as const;

/**
 * The laws the test must judge, each with its label: both halves of `Document`'s mirror with the
 * document nodes, a mirror between a relation and a constant selection of another.
 */
const required: readonly (readonly [string, (law: Law) => boolean])[] = [
  [
    "Document(package, path) in Node(package, path)",
    containedAs(["Document", documentKey], ["Node", documentKey]),
  ],
  [
    "Node(package, path) in Document(package, path)",
    containedAs(["Node", documentKey], ["Document", documentKey]),
  ],
];

layer(NodeServices.layer, { excludeTestServices: true })(
  "every law the host can judge over the every-relation package",
  (it) => {
    it.effect(
      "holds every law the host can judge over the every-relation package's rows, and judges every one",
      () =>
        // Oracle: the schema's own statements over the rows the import writes, each law as the
        // database states it, and the law oracle's verdict on the package.
        // Bound: the every-relation package, every relation of it written, and every containment,
        // mirrors, key and check of Qti.
        Effect.scoped(
          Effect.gen(function* everyLawHolds() {
            const dir = yield* scopedPackage(
              everyRelationPackage({ choices: 2, hotspots: 1, hottexts: 1 }),
            );
            const verdict = yield* oracleVerdict(yield* readEntries(dir));
            const program = yield* readProgram(dir, nameOf(dir));
            const rows = previewRowsOf(program.inputs);
            const laws = judgedLaws(Qti);
            const judgment = judge(rows, laws);

            assert.deepStrictEqual(verdict, { kind: "accepted" });
            assert.deepStrictEqual(
              judgment.broken.map(
                ({ law, rows: breaking }) =>
                  `${Formatter.format(law)}: ${Formatter.format(breaking)}`,
              ),
              [],
              "a law the import's rows break",
            );

            assert.deepStrictEqual(
              required.flatMap(([label, is]) => (judgment.judged.some(is) ? [] : [label])),
              [],
              "a law the test must judge went unjudged",
            );

            assert.deepStrictEqual(
              judgment.skipped.map(
                ({ law, unjudged }) => `${Formatter.format(law)}: ${unjudged.join("; ")}`,
              ),
              [],
              "a law the host cannot judge over the package's rows",
            );
          }),
        ),
    );
  },
);
