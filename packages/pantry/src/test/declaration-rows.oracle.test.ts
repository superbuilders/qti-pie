/**
 * Declarations whose cardinality or base type spells nothing (lane NIL's audit, B11; spec reading
 * 158), held three ways over every declaration of the every-relation package: the law oracle, the
 * importer's rows, and the families and checks those rows feed.
 *
 * A declaration is judged, and every element below it, whatever its attributes spell; its
 * cardinality and its base type are each its attribute's code, read by a view only where the
 * attribute is written and spells one (`DeclarationCardinality` and `DeclarationBaseType` of
 * `#pantry/qti/names.ts`), as its name is (spec reading 157). Before, one whose cardinality was
 * unwritten or spelled nothing had a row holding `""` and `single`: a missing value as a sentinel,
 * which its own `E1_derived` refused and every row that copied it judged; then it had no row at
 * all, so the copies its children ask broke beside its own law.
 *
 * For the first declaration of each kind in each of the every-relation items and its test, under
 * each state that leaves its cardinality or its base type spelling nothing:
 *
 * - The oracle raises AL3's required attribute or the attribute's value domain at the declaration,
 *   and where only its cardinality or base type changed, nothing else;
 * - The views read the declaration, and no code of the edited attribute: no `DeclarationCardinality`
 *   for a cardinality, while a binding or a reference still resolves to it by name (spec reading
 *   159), and no `DeclarationBaseType` for a base type, read here from the import's rows as the
 *   views read them (`viewedDeclarationsOf`). No row copies either (decision S3): every law that
 *   reads one joins its view through a query, so none reads what the declaration does not spell;
 * - No family member names an owner the import writes no row of (`#pantry/test/family-owners.ts`), so
 *   no row of a relation grizzle writes before `Node` breaks a CHECK.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { readProgram } from "#pantry/import/program.ts";
import {
  declarationCase,
  declarationSites,
  declarationStates,
  expectedRulesOf,
} from "#pantry/test/declaration-cases.ts";
import { viewedDeclarationsOf } from "#pantry/test/declaration-queries.ts";
import { orphansOf } from "#pantry/test/family-owners.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { filesOf } from "#pantry/test/oracle-complete/mutation.ts";
import { judge, ruleOf, shownBreach } from "#pantry/test/oracle.ts";
import { laws } from "#pantry/test/installed-laws.ts";
import { nodePlacesOf } from "#pantry/test/places.ts";

/**
 * Every (site, state) of the scope, by its number: the first declaration of each kind in each
 * document, under every state that applies to it. A later declaration of one kind in one document
 * is read by the same `typedDeclarationOf` and judged by the same laws, so it decides nothing the
 * first does not; the first of each kind is the one the document's interactions, references and
 * processing name (`RESPONSE`, `SCORE`), so it carries the rows that hang from a declaration.
 */
const cases = declarationSites
  .filter(({ ordinal }) => ordinal === 0)
  .flatMap((site) =>
    declarationStates.filter((state) => state.applies(site)).map((state) => ({ site, state })),
  );

/**
 * Hold one case: the oracle's rules at the declaration, and the importer's rows.
 *
 * @param at - The case's number.
 * @returns The check.
 */
const holds = (at: number) =>
  Effect.gen(function* declarationRowHolds() {
    const drawn = cases[at];
    assert.isDefined(drawn, `no case ${String(at)}`);
    if (drawn === undefined) {
      return;
    }

    const { site, state } = drawn;
    const label = `${site.path} ${site.identifier} ${state.name}`;
    const entries = declarationCase(site, state);

    const judgment = yield* judge(filesOf(entries), grammar, laws);
    assert.strictEqual(judgment._tag, "Judged", `${label}: the codec refuses the case`);

    const breaches = judgment._tag === "Judged" ? judgment.breaches : [];
    const shown = breaches.map((breach) => `  ${shownBreach(breach, grammar)}`).join("\n");
    const rules = [...new Set(breaches.map(({ law }) => ruleOf(law)))].toSorted();
    const expected = expectedRulesOf(state);
    if (state.alone) {
      assert.deepStrictEqual(rules, expected, `${label}: the oracle's rules:\n${shown}`);
    } else {
      for (const rule of expected) {
        assert.include(rules, rule, `${label}: the oracle's rules:\n${shown}`);
      }
    }

    const { inputs } = yield* readProgram(yield* scopedPackage(entries), "scoped");
    // The document's nodes in document order, its pre-order: the site's place among its kind's.
    const places = [...nodePlacesOf(inputs).values()].filter(({ path }) => path === site.path);
    const declarationNode = places
      .toSorted((left, right) => Number(left.start - right.start))
      .filter(({ kind }) => kind === site.kind)[site.ordinal];
    assert.isDefined(declarationNode, `${label}: its element has no Node row`);

    const viewed = viewedDeclarationsOf(inputs).find(
      ({ path, start }) => path === site.path && start === declarationNode?.start,
    );
    assert.isDefined(viewed, `${label}: the views read no declaration there`);
    assert.isUndefined(
      state.attribute === "cardinality" ? viewed?.cardinality : viewed?.baseType,
      `${label}: a code stands for its ${state.attribute}`,
    );

    const orphans = orphansOf(inputs);
    assert.deepStrictEqual(
      orphans,
      [],
      `${label}: family members with no owner row: ${orphans.map(({ key, member, owner }) => `${member} ${key} into ${owner}`).join("; ")}`,
    );
  }).pipe(Effect.scoped, Effect.provide(NodeServices.layer));

describe("declarations whose cardinality or base type spells nothing (spec reading 158)", () => {
  it.effect("keep their rows, and are refused by AL3 or the value domain alone", (ctx) =>
    // Oracle: the specification as a checker (the law oracle), and the families and checks the
    // importer's rows feed, read over those rows. Bound: the first declaration of each kind in
    // each of the every-relation items, under each state of its cardinality and base
    // type that spells nothing, exhausted.
    searched(
      ctx,
      exhaust(
        {
          box: "the first declaration of each kind in each item, under each untyped state",
          caseHang: Duration.seconds(120),
          concurrency: 1,
          coverage: noCoverage,
          generator: int(0, cases.length - 1),
          literal: (at) => {
            const drawn = cases[at];

            return drawn === undefined
              ? String(at)
              : `${drawn.site.path} ${drawn.site.identifier} ${drawn.state.name}`;
          },
          oracle: { kind: "specification", name: "the law oracle, and the rows' own laws" },
          suite: "pantry/declaration-rows",
        },
        holds,
      ),
    ),
  );
});
