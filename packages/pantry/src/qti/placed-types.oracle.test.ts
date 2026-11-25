/**
 * A response rules fragment an item includes is typed in that item (spec reading 117: "the content
 * of the fragment must satisfy the requirements of the specification in the context of the item in
 * which it is being included"), on the import's rows as in the law oracle. A reference in an
 * included fragment resolves in its item's placement, among the item's declarations
 * (`PlacedVariableRef` of `#pantry/qti/expressions.ts`, its declaration the query
 * `PlacedVariableRefDeclaration` of `#pantry/qti/overlay-queries/reference.ts`), and each of the
 * fragment's expressions is typed there (`PlacedExpression`). "Mapped response" holds a map
 * response's row to its declaration's mapping, as it holds an item's own reference (information
 * model §7.22, spec reading 166), and "Condition type" holds a variable reference that is a whole
 * condition to its declaration's type, boolean single, its placed expression's type (P21,
 * `#pantry/qti/overlay-queries/expression.ts`). The oracle types the fragment in its assembly, as
 * the import's rows do. A rule over a query is the database's alone (the host leaves it unknown,
 * `#pantry/test/gen/genetic/host-laws.ts`), and "Condition type" reads the expression's parent's
 * kind, its node's, so it is a rule over a query whether the condition is included or inline: each
 * breaks it in the oracle and on PostgreSQL, and the import's rows on the host name no law of it.
 *
 * Oracle: a second implementation, the law oracle (`#pantry/test/oracle.ts` `judge`), against the
 * laws the import's rows break on the host (`#pantry/test/gen/genetic/judge.ts` `judgeOne`).
 *
 * Bound: one item whose response, an identifier, declares no mapping. Its response processing tests
 * a map response of it, written in an included fragment, then the controls: the same rule written
 * inline, and the included one over a response that declares a mapping. Then it tests the response
 * itself as a condition, included and inline, and the control, an included match of the response
 * with its correct value. Then one fragment that compares the response with a half (`qti-gt`),
 * included by two items whose responses are floats, by a float's item and an identifier's, and by
 * an identifier's item alone. 9 cases, exhausted. The first breaks "Mapped response" in the oracle,
 * the database's alone on the import's side, since a placed map response's claim of its
 * declaration's mapping reads the declaration's node's children through a query; the second the
 * same, since an item's own map response reads the declaration it names through a query too, and
 * the third breaks it on neither side; each condition breaks "Condition type" in the oracle, the
 * database's alone on the import's side; the included match is accepted on both. The shared
 * fragment is typed in each item that includes it: under two floats it is accepted on both, and
 * where an item's response is an identifier it breaks "Operand fit" (P23) in the oracle, the
 * database's alone on the import's side, since the operands' fit reads `OperandOf`, a query.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { genomeOf } from "#pantry/test/gen/genetic/genome.ts";
import { judgeOne, shownDisagreement } from "#pantry/test/gen/genetic/judge.ts";
import { lawsOf } from "#pantry/test/oracle.ts";
import {
  bare,
  includingOf,
  inlineOf,
  mapped,
  mapping,
  matched,
  sharedOf,
} from "#pantry/test/placed-types.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";

/**
 * The oracle's law tables over the composed grammar.
 */
const laws = lawsOf(grammar);

/**
 * One case: what it is, the package, the law it is about, and what both sides say of it: neither
 * breaks the law, both accept the package, or the oracle breaks the law where the import's side
 * states it only as a rule over a query, which the host leaves to the database (`database`).
 */
interface Case {
  readonly entries: PackageEntries;
  readonly expected: "accepted" | "database" | "holds";
  readonly law: "Condition type" | "Mapped response" | "Operand fit";
  readonly name: string;
}

/**
 * Every case of the bound: the included map response with no mapping (research aeced65a's
 * `V-O18-include-map-response-no-mapping`), then its controls, the inline one
 * (`V-O18-inline-map-response-no-mapping`) and the included one with a mapping; the included
 * identifier condition (`V-O38-include-nonboolean-condition`), then its controls, the inline one
 * (`V-O38-inline-nonboolean-condition`) and the included match (`V-control-include-good`); then
 * the fragment two float items include, the one a float's item and an identifier's include, and the
 * one an identifier's item includes alone.
 */
const cases: readonly Case[] = [
  {
    entries: includingOf("", mapped),
    expected: "database",
    law: "Mapped response",
    name: "an included map response of a response with no mapping",
  },
  {
    entries: inlineOf(mapped),
    expected: "database",
    law: "Mapped response",
    name: "an inline map response of a response with no mapping",
  },
  {
    entries: includingOf(mapping, mapped),
    expected: "holds",
    law: "Mapped response",
    name: "an included map response of a response with a mapping",
  },
  {
    entries: includingOf("", bare),
    expected: "database",
    law: "Condition type",
    name: "an included condition that is an identifier response",
  },
  {
    entries: inlineOf(bare),
    expected: "database",
    law: "Condition type",
    name: "an inline condition that is an identifier response",
  },
  {
    entries: includingOf("", matched),
    expected: "accepted",
    law: "Condition type",
    name: "an included condition that matches a response with its correct value",
  },
  {
    entries: sharedOf(["float", "float"]),
    expected: "accepted",
    law: "Operand fit",
    name: "a fragment two items include, each response a float",
  },
  {
    entries: sharedOf(["float", "identifier"]),
    expected: "database",
    law: "Operand fit",
    name: "a fragment two items include, one response a float and one an identifier",
  },
  {
    entries: sharedOf(["identifier"]),
    expected: "database",
    law: "Operand fit",
    name: "a fragment one item includes, its response an identifier",
  },
];

/**
 * A law's name as a whole word of a summary.
 *
 * @param law - The law.
 * @returns The pattern.
 */
const lawPattern = (law: Case["law"]): RegExp => new RegExp(`\\b${law}\\b`, "u");

layer(NodeServices.layer, { excludeTestServices: true })(
  "a reference in an included rules fragment",
  (it) => {
    it.effect(
      "is typed by its item's declaration, on the import's rows as in the law oracle",
      (ctx) =>
        searched(
          ctx,
          Effect.gen(function* placedTypesRuns() {
            const directory = yield* scratchDirectory("placed-types-");
            const bench = { directory, grammar, laws };

            assert.strictEqual(cases.length, 9);

            return yield* exhaust(
              {
                box: "the 9 placed type cases: a map response of a response with no mapping, included and inline, and an included one of a response with a mapping; an identifier response as a condition, included and inline, and an included match of it with its correct value; a fragment comparing the response with a half, included by two float items, by a float item and an identifier item, and by an identifier item alone",
                caseHang: Duration.minutes(5),
                concurrency: 1,
                coverage: noCoverage,
                generator: int(0, cases.length - 1),
                literal: (at) => cases[at]?.name ?? String(at),
                oracle: {
                  kind: "second-implementation",
                  name: "the law oracle against the laws the import's rows break on the host",
                },
                suite: "pantry/placed-types",
              },
              (at) =>
                Effect.gen(function* placedTypesCase() {
                  const of = cases[at];
                  assert.isDefined(of, `no case ${String(at)}`);
                  if (of === undefined) {
                    return;
                  }

                  const judged = yield* judgeOne(yield* genomeOf(of.entries), bench, at);
                  const said = `${of.name}: the oracle ${judged.summary.oracle}; the import ${judged.summary.import}`;
                  if (of.expected === "accepted") {
                    // Neither side breaks a law: the oracle judges no breach, the import builds
                    // with none.
                    assert.deepStrictEqual(judged.disagreements.map(shownDisagreement), [], said);
                    assert.strictEqual(judged.summary.oracle, "laws ", said);
                    assert.strictEqual(judged.summary.import, "built ", said);

                    return;
                  }

                  const apart = judged.disagreements.filter(
                    (disagreement) =>
                      (disagreement.kind === "oracle-only-law" ||
                        disagreement.kind === "import-only-law") &&
                      disagreement.law === of.law,
                  );
                  const pattern = lawPattern(of.law);

                  assert.deepStrictEqual(apart.map(shownDisagreement), [], said);
                  if (of.expected === "holds") {
                    assert.notMatch(judged.summary.oracle, pattern, said);
                  } else {
                    assert.match(judged.summary.oracle, pattern, said);
                  }

                  // The import's side states the law over a query, which the host never judges:
                  // its rows break no law of it there, and the database refuses a package that
                  // breaks it.
                  assert.notMatch(judged.summary.import, pattern, said);
                }),
            );
          }).pipe(Effect.scoped),
        ),
    );
  },
);
