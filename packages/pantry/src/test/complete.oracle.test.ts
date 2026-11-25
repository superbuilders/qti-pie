/**
 * The law oracle's completeness (lane OL, R87's finding): every law the oracle declares is raised
 * by a package drawn to break it, and every law the schema states is one the oracle declares.
 *
 * R87 found laws the oracle named in its tables that no judgment of it could raise, so a test that
 * said "the law oracle predicts it" was vacuous for each. This file holds the oracle to its tables
 * both ways:
 *
 * - **Every declared law is raised.** For each law of `lawNames`, a mutation drawn to break exactly
 *   that law (`#pantry/test/oracle-complete/*.ts`) edits a generated package the oracle accepts,
 *   the every-relation package drawn by its member counts unless the mutation brings its own base,
 *   at a site and with a value it draws. The oracle must raise the law, and must raise no law whose
 *   rule stands ahead of the law's in the refusal's precedence (`#pantry/vocab/laws.ts`
 *   `precedence`), the order the database names a refusal by, so the database would name the
 *   mutated package by the law's rule. A law over rows no package text can break is broken in the
 *   folded rows of one document instead, and judged by `documentBreaches`.
 * - **Every stated law is declared.** Each law of `lawTable` is the oracle's, or the oracle states it
 *   in parts (`statedInParts`), or no host predicate can judge it, with the reason
 *   (`hostlessLaws`), or only an install's LOM policy states it, with the reason (`policyLaws`).
 *
 * A law no mutation can break alone is a row of {@link owed} with why, a list that only shrinks: a
 * law both owed and mutated fails, and so does a law neither owed nor mutated, so a law that joins
 * the oracle joins this file.
 */
import { regex } from "arkregex";
import { assert, describe, it } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import type { Case, Kept } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect } from "effect";
import { lawNames as statedLawNames } from "#pantry/import/refusal.ts";
import { lawTable, precedence } from "#pantry/vocab/laws.ts";
import type { FoldedRows } from "#pantry/model/folds.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { int } from "@bjornpagen/testing/gen";
import { everyRelationPackage, memberCounts } from "#pantry/test/gen/every-relation.ts";
import type { MemberCounts, PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { documentMutations } from "#pantry/test/oracle-complete/documents.ts";
import { contentEdits } from "#pantry/test/oracle-complete/content-edits.ts";
import { foreignEdits } from "#pantry/test/oracle-complete/foreign-edits.ts";
import { expressionMutations } from "#pantry/test/oracle-complete/expressions.ts";
import { layerMutations } from "#pantry/test/oracle-complete/layer.ts";
import {
  everyRelationBase,
  filesOf,
  foldedDocument,
  textOf,
  withText,
} from "#pantry/test/oracle-complete/mutation.ts";
import type { Mutation } from "#pantry/test/oracle-complete/mutation.ts";
import { overlayMutations } from "#pantry/test/oracle-complete/overlays.ts";
import { rowMutations } from "#pantry/test/oracle-complete/layer-rows.ts";
import { rowEdits } from "#pantry/test/oracle-complete/row-edits.ts";
import { nodeEdits } from "#pantry/test/oracle-complete/row-edits-nodes.ts";
import { packageMutations } from "#pantry/test/oracle-complete/packages.ts";
import { testMutations } from "#pantry/test/oracle-complete/tests.ts";
import { hostlessLaws, policyLaws, statedInParts } from "#pantry/test/oracle-laws.ts";
import { documentBreaches, judge, lawNames, ruleOf, shownBreach } from "#pantry/test/oracle.ts";
import type { Breach, LawName } from "#pantry/test/oracle.ts";
import { grammar } from "#pantry/grammar/install.ts";
import { laws } from "#pantry/test/installed-laws.ts";

/**
 * Every mutation of each group's module, by its name there, each naming the law it breaks
 * (`law`): a law's first mutation is named by the law, and any beside it by a name of its own.
 */
const mutations = {
  ...layerMutations,
  ...overlayMutations,
  ...packageMutations,
  ...rowMutations,
  ...rowEdits,
  ...nodeEdits,
  ...foreignEdits,
  ...contentEdits,
  ...documentMutations,
  ...expressionMutations,
  ...testMutations,
} as const satisfies Readonly<Record<string, Mutation>>;

/**
 * A mutation's name in its module's record.
 */
type MutationName = keyof typeof mutations;

/**
 * The laws no mutation breaks alone, each with why: every edit that breaks one breaks a law ranked
 * ahead of it too. The list only shrinks.
 */
const owed: Readonly<Partial<Record<LawName, string>>> = {
  "AL4 open names":
    "an Attribute row of an open class, or an OpenAttribute row of a closed name, is no row the folded rows can hold: AttributeRow's name is a ClosedName and OpenAttributeRow's class an OpenClass, so no edit of typed rows reaches the law, which the schema's check holds over the import's rows",
  "Card default entry": "its mutation is not written yet",
  "Catalog reference": "its mutation is not written yet",
  "MathML align first": "its mutation is not written yet",
  "MathML align placement": "its mutation is not written yet",
  "MathML cn form": "its mutation is not written yet",
  "MathML head qualifier": "its mutation is not written yet",
  "MathML maction selection": "its mutation is not written yet",
  "MathML share cycle": "its mutation is not written yet",
  "N2 mirrors":
    "each of xdm.ts's mirror corruptions (gap, duplicateSlot, countOffByOne) also leaves a family's last slot unread, which N7 last slot (union-count) refuses ahead of reachability; folds.oracle.test.ts holds each variant to its law",
  "Node key":
    "Node's key is (package, path, start), so a second row at one start (xdm.ts startTaken) breaks T1 document order on the same rows and moves the intervals the fold laws read, which rank ahead of reachability; folds.oracle.test.ts holds the variant to its law",
  "PCI module source": "its mutation is not written yet",
  "T2 root":
    "a second self-parented root also breaks E1's derived fields, which rank ahead of reachability; folds.oracle.test.ts holds the variant to its law",
};

/**
 * The laws the schema states that the oracle owes a declaration and a producer, each with why: the
 * list only shrinks.
 */
const owedStatements = {} as const satisfies Readonly<Record<string, string>>;

/**
 * The counterexamples each law's search keeps, by law: each replays before the search, by its
 * member counts and the draws its mutation made, and must still raise its law, by no law ahead of
 * its rule.
 */
const keptCases: Readonly<Partial<Record<MutationName, readonly Kept<MemberCounts, string>[]>>> = {
  "AL1 owner": [
    {
      draws: "7",
      note: "TEST_SEED=4172436958's counterexample, whose owner-copy kind of the context declaration's identifier left CTX no ID and raised Idref target ahead of AL1 owner; drawn now among the attributes whose corruption isolates it",
      reaches: ["AL1 owner"],
      sketch: { choices: 2, hotspots: 1, hottexts: 1 },
    },
  ],
};

/**
 * Each rule's place in the refusal's precedence.
 */
const ranks: ReadonlyMap<string, number> = new Map(precedence.map((rule, at) => [rule, at]));

/**
 * Rank a rule by the refusal's precedence: the place the database names a refusal by.
 *
 * @param rule - The rule.
 * @returns Its index in `precedence`. Throws for a rule the precedence does not rank, which no law
 *   of the oracle may keep.
 */
const rankOf = (rule: string): number => {
  const rank = ranks.get(rule);
  if (rank === undefined) {
    throw new Error(`the refusal's precedence does not rank the rule ${rule}`);
  }

  return rank;
};

/**
 * What the suite's mutations have built and judged, each once: the bases, by base function and
 * member counts; what the oracle finds wrong with each base; and the folded rows of each base
 * document a rows mutation edits, by base and path. The suite makes one and hands it to every case.
 */
interface Bases {
  readonly entries: Map<string, PackageEntries>;
  readonly faults: Map<PackageEntries, readonly string[]>;
  readonly folded: Map<string, FoldedRows<Composed>>;
}

/**
 * A suite's bases before its first case.
 *
 * @returns The bases, none built.
 */
const noBases = (): Bases => ({ entries: new Map(), faults: new Map(), folded: new Map() });

/**
 * Build a mutation's base for member counts, once.
 *
 * @param bases - What the suite has built.
 * @param build - The base's function of member counts.
 * @param members - The counts.
 * @returns The base's entries.
 */
const baseOf = (
  bases: Bases,
  build: (members: MemberCounts) => PackageEntries,
  members: MemberCounts,
): PackageEntries => {
  const key = `${build.name} ${JSON.stringify(members)}`;
  const cached = bases.entries.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const built = build(members);
  bases.entries.set(key, built);

  return built;
};

/**
 * Judge a base once, for the precondition that the oracle accepts it.
 *
 * @param bases - What the suite has built and judged.
 * @param entries - The base.
 * @returns What the oracle finds wrong with it: its breaches, shown, or its codec refusal; none for a
 *   base it accepts.
 */
const faultsOf = (bases: Bases, entries: PackageEntries) =>
  Effect.gen(function* judgeBase() {
    const cached = bases.faults.get(entries);
    if (cached !== undefined) {
      return cached;
    }

    const judgment = yield* judge(filesOf(entries), grammar, laws);
    const faults =
      judgment._tag === "Judged"
        ? judgment.breaches.map((breach) => shownBreach(breach, grammar))
        : [`the codec refuses it under ${judgment.rule}: ${judgment.detail}`];
    bases.faults.set(entries, faults);

    return faults;
  });

/**
 * Hold a mutated package's breaches to its law: the oracle raises the law, and no law whose rule
 * stands ahead of the law's in the refusal's precedence.
 *
 * @param law - The law the mutation breaks.
 * @param breaches - The oracle's breaches of the mutated package.
 * @param literal - The case, for the assertion's message.
 */
const holdsTo = (law: LawName, breaches: readonly Breach[], literal: string): void => {
  const shown = breaches.map((breach) => `  ${shownBreach(breach, grammar)}`).join("\n");

  assert.isTrue(
    breaches.some((breach) => breach.law === law),
    `${law}: the oracle does not raise it on ${literal}; it raises:\n${shown}`,
  );

  const rank = rankOf(ruleOf(law));
  const ahead = breaches.filter((breach) => rankOf(ruleOf(breach.law)) < rank);

  assert.deepStrictEqual(
    ahead.map((breach) => breach.law),
    [],
    `${law} (rule ${ruleOf(law)}): the oracle raises laws ahead of it on ${literal}:\n${shown}`,
  );
};

/**
 * Judge one drawn case of a law's mutation.
 *
 * @param bases - What the suite has built and judged.
 * @param mutation - The mutation, which names the law it breaks.
 * @returns The property over the case's member counts.
 */
const property = (bases: Bases, mutation: Mutation) => (members: MemberCounts, c: Case<string>) =>
  Effect.gen(function* breaksItsLaw() {
    const { law } = mutation;
    const literal = JSON.stringify(members);
    const entries = baseOf(
      bases,
      mutation.over === "package" ? (mutation.base ?? everyRelationBase) : everyRelationBase,
      members,
    );

    assert.deepStrictEqual(
      yield* faultsOf(bases, entries),
      [],
      `${law}: the base ${literal} breaks a law before its mutation`,
    );

    if (mutation.over === "package") {
      const mutated = c.draw(mutation.mutate({ entries, members }, grammar));
      const judgment = yield* judge(filesOf(mutated), grammar, laws);

      assert.strictEqual(
        judgment._tag,
        "Judged",
        `${law}: the codec refuses the mutated ${literal}: ${judgment._tag === "CodecRefusal" ? `${judgment.rule} ${judgment.detail}` : ""}`,
      );

      holdsTo(law, judgment._tag === "Judged" ? judgment.breaches : [], literal);
      c.note(law);

      return;
    }

    const key = `${literal} ${mutation.document}`;
    const rows =
      bases.folded.get(key) ?? (yield* foldedDocument(entries, mutation.document, grammar));
    bases.folded.set(key, rows);

    assert.deepStrictEqual(
      documentBreaches(mutation.document, rows, laws).map((breach) => shownBreach(breach, grammar)),
      [],
      `${law}: the folded ${mutation.document} of ${literal} breaks a law before its mutation`,
    );

    const mutated = c.draw(mutation.mutate(rows, grammar));

    holdsTo(law, documentBreaches(mutation.document, mutated, laws), literal);
    c.note(law);
  });

describe("every law the oracle declares", () => {
  it("has a mutation, or is owed one with why, and never both", () => {
    const mutated = new Set(Object.values<Mutation>(mutations).map(({ law }) => law));
    const listed = new Set(lawNames.filter((law) => owed[law] !== undefined));

    assert.deepStrictEqual(
      lawNames.filter((law) => !mutated.has(law) && !listed.has(law)),
      [],
      "laws with no mutation that owed does not list",
    );
    assert.deepStrictEqual(
      [...mutated].filter((law) => listed.has(law)),
      [],
      "laws owed a mutation that have one: strike them from owed",
    );
  });

  const bases = noBases();

  for (const [name, mutation] of Object.entries<Mutation>(mutations)) {
    it.effect(
      `${name}: a package drawn to break ${mutation.law} is refused by it, and by no law ahead of its rule`,
      (ctx) =>
        // Oracle: the specification as a checker. The law's own source names what breaks it,
        // and the mutation writes exactly that into a package the oracle accepts. Bound: one
        // rotating case and one floor case per law, each drawing the member counts of the
        // every-relation package (or the mutation's own base) and the mutation's site and value,
        // so the run's seed moves every law to another corner: completeness asks for one
        // package per law that raises it, and the eight bases are judged once each.
        searched(
          ctx,
          explore(
            {
              caseHang: Duration.seconds(60),
              coverage: noCoverage,
              draw: drawn(memberCounts),
              kept: Object.entries(keptCases).find(([kept]) => kept === name)?.[1] ?? [],
              literal: JSON.stringify,
              oracle: {
                kind: "specification",
                name: `${mutation.law}'s source, written into an accepted package`,
              },
              runs: 1,
              shrink: completeShrink,
              steerEvery: 16,
              suite: `pantry/oracle-complete/${name}`,
            },
            property(bases, mutation),
          ),
        ),
    );
  }
});

/**
 * The every-relation package whose declarations the absent-cardinality search exhausts: its widest
 * member counts.
 */
const absentBase = everyRelationPackage({ choices: 3, hotspots: 2, hottexts: 2 });

/**
 * One declaration of each kind that each of the base's items writes, by its document and its start
 * tag, each a site a declaration with no cardinality is written at: the declaration's kind and its
 * document are what AL3 and the laws over cardinality read, so a second declaration of one kind in
 * one document is a case the first already decides.
 */
const declarationSites = ["items/item.xml", "items/item2.xml", "items/item3.xml"].flatMap(
  (path) => [
    ...new Map(
      [
        ...textOf(absentBase, path).matchAll(
          regex.as<string, { names: Record<string, string | undefined> }>(
            '<qti-(?<kind>context|response|outcome|template)-declaration [^>]*cardinality="[^"]*"[^>]*>',
            "gu",
          ),
        ),
      ].map((match) => [match.groups?.["kind"], { path, tag: match[0] }] as const),
    ).values(),
  ],
);

describe("a declaration that writes no cardinality", () => {
  it.effect("is refused under required-attribute alone, an absent attribute no empty one", (ctx) =>
    // Oracle: the specification as a checker. AL3 refuses a declaration with no cardinality, and
    // no law that reads a declaration's cardinality judges the `single` the schema holds an
    // unwritten one as, so the oracle raises no other rule (the orchestrator's ruling of
    // 2026-11-06: an absent attribute is no empty one, and one cause is refused under one rule).
    // Bound: one declaration of each kind in each of the every-relation items and in its test,
    // each its cardinality dropped, exhausted.
    searched(
      ctx,
      exhaust(
        {
          box: "one declaration of each kind in each item, its cardinality dropped",
          caseHang: Duration.seconds(60),
          coverage: noCoverage,
          generator: int(0, declarationSites.length - 1),
          literal: String,
          oracle: { kind: "specification", name: "AL3's required cardinality, alone" },
          suite: "pantry/oracle-complete/absent-cardinality",
        },
        (at) =>
          Effect.gen(function* absentCardinality() {
            const site = declarationSites[at];
            assert.isDefined(site, `no declaration site ${String(at)}`);

            const { path, tag } = site ?? { path: "", tag: "" };
            const mutated = withText(
              absentBase,
              path,
              textOf(absentBase, path).replace(
                tag,
                tag.replace(regex(' cardinality="[^"]*"', "u"), ""),
              ),
            );
            const judgment = yield* judge(filesOf(mutated), grammar, laws);
            const rules =
              judgment._tag === "Judged"
                ? judgment.breaches.map(({ law }) => ruleOf(law))
                : [judgment.rule];

            assert.deepStrictEqual(
              [...new Set(rules)],
              ["required-attribute"],
              `${path} ${tag}:\n${judgment._tag === "Judged" ? judgment.breaches.map((breach) => shownBreach(breach, grammar)).join("\n") : judgment.detail}`,
            );
          }),
      ),
    ),
  );
});

describe("every law the schema states", () => {
  it("is the oracle's, stated by it in parts, judged by no host predicate, stated by a media policy alone, or owed, each with why", () => {
    const declared = new Set<string>(lawNames);
    for (const law of statedLawNames) {
      const ways = [
        declared.has(law) ? "declared" : "",
        Object.hasOwn(statedInParts, law) ? "in parts" : "",
        Object.hasOwn(hostlessLaws, law) ? "hostless" : "",
        Object.hasOwn(policyLaws, law) ? "policy" : "",
        Object.hasOwn(owedStatements, law) ? "owed" : "",
      ].filter((way) => way !== "");

      assert.strictEqual(ways.length, 1, `${law} is ${ways.join(" and ") || "nowhere"}`);
    }

    for (const [law, parts] of Object.entries(statedInParts)) {
      const stated = statedLawNames.find((name) => name === law);
      for (const part of parts) {
        const declaredPart = lawNames.find((name) => name === part);

        assert.isDefined(declaredPart, `${law}'s part ${part} is no oracle law`);
        assert.strictEqual(
          declaredPart === undefined ? "" : ruleOf(declaredPart),
          stated === undefined ? "" : lawTable[stated].rule,
          `${law}'s part ${part} keeps another rule`,
        );
      }
    }

    for (const [law, reason] of Object.entries(hostlessLaws)) {
      assert.isTrue(
        statedLawNames.some((name) => name === law),
        `${law} is hostless and the schema states no such law`,
      );
      assert.isAbove(reason.length, 0, `${law} is hostless without a reason`);
    }

    for (const [law, reason] of Object.entries(policyLaws)) {
      assert.isTrue(
        statedLawNames.some((name) => name === law),
        `${law} is a policy's and the law table holds no such law`,
      );
      assert.isAbove(reason.length, 0, `${law} is a policy's without a reason`);
    }
  });
});
