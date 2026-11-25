/**
 * The genetic differential: a feature-guided genetic search for every disagreement between the
 * law oracle (`#pantry/test/oracle.ts`, the independent implementation) and the import's host path
 * (`#pantry/import/program.ts` `readProgram`: its refusal, or the rows it builds, held to the laws
 * the schema states on the host), with no database (`#pantry/test/gen/genetic/`).
 *
 * The free suite replays; `QTI_PIE_GENETIC=1` explores. A search whose path moves with every
 * commit to the import, the oracle or the grammar would turn the free suite red where nothing it
 * holds changed, so the free suite judges only kept packages, each the same on every run:
 *
 * - Each known entry's package (`#pantry/test/gen/genetic/known.ts`) must still show its class, so an
 *   entry its owner's fix closed fails as stale until the fix's commit deletes it, and each fixed
 *   entry's must never show its class again, under its plain signature or under any stated limit;
 *   an entry that names a noise is judged beside its package's noised twin, as the search judges
 *   it, since a noise's class shows only there;
 * - No signature is a class of both tables: a known class whose plain signature is a fixed entry's is
 *   keyed by the stated limit it falls under (`#pantry/test/gen/genetic/judge.ts` `limitOf`), so
 *   the fixed entry keeps guarding the cause it closed;
 * - Each known and fixed entry's signature is a class some package can show: a law the host judges
 *   (grizzle's `sameLaw` holds it one of them, its selections included, and an oracle-only law is
 *   one some judged law bears the name of), since a law no statement states or a law the host never
 *   judges can never show, and a fixed entry keyed by it guards nothing;
 * - Each planted value-domain case (`#pantry/test/gen/genetic/planted.ts`) lies inside its domain's
 *   lexical space and outside its facets, which the oracle refuses and today's database does not,
 *   so the two disagree on it while it waits on its owner's fix, and must agree on it once the fix
 *   lands.
 *
 * The exploration is the genetic loop, one case per run: its swarm over the edit operators and its
 * seed are the case's draw, so its replay token replays the run. A run judges seeds drawn from the
 * corpus (the every-relation package, R87's assembly packages and the packaging fixtures), then
 * breeds candidates from parents picked by novelty over the features both sides show (law ×
 * element kind × document root on the oracle's side, rule × stage on the import's), each by
 * structural edits, crossover and named faults. Every class of disagreement it meets that no known
 * entry records is reduced to its smallest package and reported, all of them in one failure; each
 * becomes a known entry, its reduced package kept, with the lane that owns its fix. After the last
 * run, the Good–Turing residual of each feature family over the rotating runs is printed: residual
 * risk of the generator and its features, never proof.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { afterAll, assert, layer } from "@effect/vitest";
import { exhaust, explore, steered } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { boundedShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Option } from "effect";
import { sameLaw } from "@bjornpagen/grizzle";
import { grammar } from "#pantry/grammar/install.ts";
import { lawTable } from "#pantry/vocab/laws.ts";
import { corpusOf } from "#pantry/test/gen/genetic/corpus.ts";
import { residualsOf } from "#pantry/test/gen/genetic/engine.ts";
import type { Budget } from "#pantry/test/gen/genetic/engine.ts";
import { genomeOf } from "#pantry/test/gen/genetic/genome.ts";
import { judgedLaws } from "#pantry/test/gen/genetic/host-laws.ts";
import { noised } from "#pantry/test/gen/genetic/noise.ts";
import {
  familyOf,
  judgeOne,
  movedBy,
  recordsClassOf,
  recordsPlainClassOf,
  classLawOf,
  sameSignature,
  shownDisagreement,
  shownSignature,
} from "#pantry/test/gen/genetic/judge.ts";
import type { Disagreement, Feature, Signature } from "#pantry/test/gen/genetic/judge.ts";
import { fixed, known, knownEntries } from "#pantry/test/gen/genetic/known.ts";
import { plantedCases } from "#pantry/test/gen/genetic/planted.ts";
import {
  hunt,
  runLiteral,
  runSketch,
  shownReport,
  shownResidual,
} from "#pantry/test/gen/genetic/search.ts";
import type { Isolating } from "#pantry/test/gen/genetic/search.ts";
import { lawNameOf } from "#pantry/import/refusal.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";
import { settings } from "#pantry/test/settings.ts";
import { laws } from "#pantry/test/installed-laws.ts";

/**
 * The exploration's budget, which `QTI_PIE_GENETIC=1` runs: `runs` is the rotating stream's runs
 * (the floor stream runs a quarter as many), `budget` each run's, `isolating` its isolation
 * phase's, and `tries` each reduction's.
 */
const chosen = {
  budget: { candidates: 600, edits: 4, generation: 1, initial: 12 },
  isolating: { laws: 200, tries: 60 },
  runs: 8,
  tries: 400,
} as const satisfies {
  readonly budget: Budget;
  readonly isolating: Isolating;
  readonly runs: number;
  readonly tries: number;
};

/**
 * The known entries, which must still show their class, then the fixed ones, which must not.
 */
const knownList = [
  ...known.map((entry) => ({ entry, shows: true })),
  ...fixed.map((entry) => ({ entry, shows: false })),
] as const;

/**
 * Whether a disagreement shows an entry's class as the replay below reads it: a known entry's as it
 * is keyed, stated limit included, and a fixed entry's under its plain signature, so under any
 * stated limit or none, whether or not the entry is keyed by one.
 *
 * @param signature - The entry's signature.
 * @param shows - Whether the entry is a known one, which must show its class, and not a fixed one.
 * @param disagreement - The disagreement.
 * @returns Whether the disagreement is of the entry's class.
 */
const showsClass = (signature: Signature, shows: boolean, disagreement: Disagreement): boolean =>
  shows
    ? recordsClassOf([signature], disagreement)
    : recordsPlainClassOf([signature], disagreement);

/**
 * The disagreement of a signature's class: one whose signature {@link signatureOf} reads as it,
 * with the stated limit it carries, and whose other fields are empty.
 *
 * @param signature - The signature.
 * @returns A disagreement of its class.
 */
const disagreementOf = (signature: Signature): Disagreement => {
  const limited = signature.limit === undefined ? {} : { limit: signature.limit };
  switch (signature.kind) {
    case "import-died":
    case "oracle-died": {
      return { detail: signature.detail, kind: signature.kind, ...limited };
    }
    case "codec-rule": {
      return {
        importRule: signature.importRule,
        kind: signature.kind,
        oracleRule: signature.oracleRule,
        ...limited,
      };
    }
    case "codec-import-only": {
      return {
        importRule: signature.importRule,
        kind: signature.kind,
        oracleRules: "",
        ...limited,
      };
    }
    case "codec-oracle-only": {
      return { kind: signature.kind, oracleRule: signature.oracleRule, ...limited };
    }
    case "import-only-law": {
      return {
        broken: classLawOf(signature.law),
        kind: signature.kind,
        law: signature.law.kind,
        rule: "",
        witness: "",
        ...limited,
      };
    }
    case "oracle-only-law": {
      return { keys: "", kind: signature.kind, law: signature.law, rule: "", ...limited };
    }
    case "noise-moved": {
      return {
        after: "",
        before: "",
        kind: signature.kind,
        noise: signature.noise,
        salt: 0,
        side: signature.side,
        ...limited,
      };
    }
    case "lone-refusal": {
      return {
        importRule: signature.importRule,
        kind: signature.kind,
        law: signature.law,
        laws: signature.law,
        rule: "",
        witness: signature.witness,
        ...limited,
      };
    }
  }
};

/**
 * A manifest whose one resource holds `child`, which the import's rows bound only where the
 * database fills `Attribute.idrefText` from it.
 *
 * @param child - The resource's child element.
 * @returns The manifest's text.
 */
const filledManifest = (child: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:cpx="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_extensionv1p2"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource>${child}</resource></resources></manifest>`;

/**
 * An NCName of `bytes` ASCII bytes.
 *
 * @param bytes - Its length in bytes.
 * @returns The name.
 */
const nameOf = (bytes: number): string => `K${"x".repeat(bytes - 1)}`;

/**
 * /**
 * PostgreSQL 19's limit on one B-tree entry (BTMaxItemSize at 8 kB blocks), past which no key
 * could hold a text as itself.
 */
const btreeEntryBytes = 2704;

/**
 * The manifests whose identifierref the database's fold copies into `Attribute.idrefText`, a field
 * the import never writes, of any length, beside its token, `Idref.token`, an `xs:ID` of any
 * length a key holds by its SHA-256 (`tokenDigest`), which the import writes: one byte past a
 * B-tree entry on a cp:variant and on a cp:dependency, and a short one on the variant.
 */
const filledCases = [
  {
    manifest: filledManifest(`<cpx:variant identifierref="${nameOf(btreeEntryBytes + 1)}"/>`),
    name: "a cp:variant's identifierref past a B-tree entry",
  },
  {
    manifest: filledManifest(`<dependency identifierref="${nameOf(btreeEntryBytes + 1)}"/>`),
    name: "a cp:dependency's identifierref past a B-tree entry",
  },
  {
    manifest: filledManifest(`<cpx:variant identifierref="${nameOf(8)}"/>`),
    name: "a cp:variant's short identifierref",
  },
] as const;

/**
 * The class no filled case may show: the oracle finding a key text past its bound that the import's
 * rows hold.
 */
const keyTextBound: Signature = { kind: "oracle-only-law", law: "Key text bound" };

/**
 * The names of the laws the host judges ({@link judgedLaws}), each as `Qti` names its law.
 */
const judgedNames: ReadonlySet<string> = new Set(
  judgedLaws.flatMap((law) => Option.toArray(lawNameOf(law))),
);

/**
 * Whether some package can show a signature's class: for a law the rows break, a law the host
 * judges, which grizzle's `sameLaw` holds one of {@link judgedLaws}, its selections included; for
 * a law the oracle alone raises, a law some judged law bears the name of, since the disagreement
 * needs the host to hold every statement of the law, and the host never holds a law it does not
 * judge (a law stated only over queries, or a check over one, is never judged). A class that
 * names a law by its name carries a
 * name the type keeps to the law table; a rule, or a noise and the side it moved, is no law of the
 * host's to judge, so nothing bounds it, and a package a noise moves shows it.
 *
 * @param signature - The signature.
 * @returns Whether it can show.
 */
const canShow = (signature: Signature): boolean => {
  switch (signature.kind) {
    case "import-only-law": {
      return judgedLaws.some(
        (law) =>
          law.kind === signature.law.kind && sameLaw(classLawOf(law), classLawOf(signature.law)),
      );
    }
    case "oracle-only-law": {
      return judgedNames.has(signature.law);
    }
    case "codec-import-only":
    case "codec-oracle-only":
    case "codec-rule":
    case "import-died":
    case "lone-refusal":
    case "noise-moved":
    case "oracle-died": {
      return true;
    }
  }
};

/**
 * Signatures that no package can show, one of each shape {@link canShow} reads: three this file
 * once kept, each naming a relation or a field `Qti` no longer has, and the containment of a
 * declaration's cardinality in its attribute with its selections dropped, which the text keys this
 * file once held wrote for two laws `Qti` states, its `base-type` and its `cardinality`
 * attribute's, and no law of `Qti` is; and two laws the oracle raises that the host never judges,
 * `LomObjectTitle`, stated only over queries, and `Set type`, a check over one, which a fixed entry
 * once guarded: the guard below must refuse each.
 */
const unshowable: readonly Signature[] = [
  {
    kind: "import-only-law",
    law: { kind: "check", name: "E1_derived", relation: "MappingSource" },
  },
  {
    kind: "import-only-law",
    law: {
      field: "stringPiece",
      kind: "pattern",
      patterns: [{ flags: "u", source: "^[\\s\\S]*$" }],
      relation: "Node",
    },
  },
  {
    kind: "import-only-law",
    law: {
      from: {
        relation: "Attribute",
        selection: { conjuncts: [] },
        terms: [
          { field: "node", kind: "field" },
          { field: "lexical", kind: "field" },
        ],
      },
      kind: "contained",
      to: {
        relation: "ObjectIdentifier",
        selection: { conjuncts: [] },
        terms: [
          { field: "node", kind: "field" },
          { field: "identifierLexical", kind: "field" },
        ],
      },
    },
  },
  {
    kind: "import-only-law",
    law: {
      from: {
        relation: "DeclarationCardinality",
        selection: { conjuncts: [] },
        terms: [{ field: "node", kind: "field" }],
      },
      kind: "contained",
      to: {
        relation: "Attribute",
        selection: { conjuncts: [] },
        terms: [{ field: "node", kind: "field" }],
      },
    },
  },
  { kind: "oracle-only-law", law: "LomObjectTitle" },
  { kind: "oracle-only-law", law: "Set type" },
];

/**
 * The classes the known entries record, which the search reports unreduced and does not fail on.
 */
const recorded: readonly Signature[] = known.map(({ signature }) => signature);

/**
 * What the suite's runs saw, for the report printed after the last: the suite makes one and hands
 * it to every run.
 */
interface Tally {
  /**
   * Each feature over the rotating runs, with the runs that showed it, for the residual.
   */
  readonly acrossRuns: Map<Feature, number>;
  /**
   * The rotating runs counted into {@link Tally.acrossRuns}.
   */
  rotatingRuns: number;
  /**
   * Each law the oracle raised in any run, with the candidates that raised it, whether one raised
   * it alone, and the laws every candidate that raised it raised beside it.
   */
  readonly isolation: {
    readonly alone: Set<string>;
    readonly beside: Map<string, ReadonlySet<string>>;
    readonly raised: Map<string, number>;
  };
}

/**
 * A suite's tally before its first run.
 *
 * @returns The tally, empty.
 */
const emptyTally = (): Tally => ({
  acrossRuns: new Map(),
  isolation: { alone: new Set(), beside: new Map(), raised: new Map() },
  rotatingRuns: 0,
});

/**
 * Print what the suite's runs saw, once the last has run: the laws broken alone, raised only
 * beside others or never raised, and the residual risk over the rotating runs.
 *
 * @param tally - The suite's tally.
 */
const reportTally = ({ acrossRuns, isolation, rotatingRuns }: Tally): void => {
  if (!settings.geneticRequested) {
    return;
  }

  const never = Object.keys(lawTable).filter((law) => !isolation.raised.has(law));
  const together = isolation.raised
    .keys()
    .filter((law) => !isolation.alone.has(law))
    .map(
      (law) =>
        `${law} (${String(isolation.raised.get(law) ?? 0)} raised, always beside ${[...(isolation.beside.get(law) ?? [])].join(", ") || "no one law"})`,
    )
    .toArray();
  const lines = residualsOf(acrossRuns, rotatingRuns, familyOf).map(
    ({ estimate, family, observed, singletons }) =>
      `${family}: ${String(singletons)} of ${String(observed)} features in one run of ${String(rotatingRuns)}, Good–Turing ${estimate.toFixed(3)}`,
  );
  console.log(
    `genetic differential, laws broken alone: ${String(isolation.alone.size)} of ${String(Object.keys(lawTable).length)} stated\nraised, never alone: ${together.join("; ") || "none"}\nnever raised: ${never.join(", ") || "none"}`,
  );
  console.log(`genetic differential, residual risk over the rotating runs:\n${lines.join("\n")}`);
};

layer(NodeServices.layer, { excludeTestServices: true })(
  "the genetic differential of the import's host path and the law oracle",
  (it) => {
    const tally = emptyTally();

    afterAll(() => {
      reportTally(tally);
    });

    it.effect("still shows every known disagreement, and no fixed one", (ctx) =>
      searched(
        ctx,
        Effect.gen(function* knownRuns() {
          const directory = yield* scratchDirectory("genetic-known-");
          const bench = { directory, grammar, laws };

          return yield* exhaust(
            {
              /**
               * Each known and fixed entry's package, judged once, and beside its noised twin where
               * the entry names a noise.
               */
              box: "every known and fixed disagreement's package",
              caseHang: Duration.minutes(5),
              coverage: noCoverage,
              generator: int(0, knownList.length - 1),
              literal: (at) => {
                const held = knownList[at];

                return held === undefined ? String(at) : shownSignature(held.entry.signature);
              },
              /**
               * A second implementation, the law oracle, against readProgram's refusal and the laws
               * its rows hold on the host.
               */
              oracle: {
                kind: "second-implementation",
                name: "the law oracle against readProgram's refusal and its rows' host laws",
              },
              suite: "pantry/genetic-known",
            },
            (at) =>
              Effect.gen(function* knownCase() {
                const held = knownList[at];
                assert.isDefined(held, `no known entry ${String(at)}`);

                const { entry, shows } = held;
                const genome = yield* genomeOf(knownEntries(entry));
                const judged = yield* judgeOne(genome, bench, at);
                const moved =
                  entry.noised === undefined
                    ? []
                    : movedBy(
                        judged,
                        yield* judgeOne(
                          noised(genome, entry.noised.noise, entry.noised.salt),
                          bench,
                          at,
                        ),
                        entry.noised.noise,
                        entry.noised.salt,
                      );
                const disagreements = [...judged.disagreements, ...moved];
                const signature = shownSignature(entry.signature);
                const shown = disagreements.map(shownDisagreement).join("; ") || "none";
                assert.strictEqual(
                  disagreements.some((disagreement) =>
                    showsClass(entry.signature, shows, disagreement),
                  ),
                  shows,
                  shows
                    ? `stale: ${signature} no longer shows, which waits on ${entry.owner}'s fix (${entry.fix}); delete its entry from #pantry/test/gen/genetic/known.ts in the fix's commit, or move it to fixed (its package shows ${shown})`
                    : `${signature} shows again, which ${entry.owner}'s fix (${entry.fix}) closed (its package shows ${shown})`,
                );
              }),
          );
        }).pipe(Effect.scoped),
      ),
    );

    it.effect("flags no key text past its bound in a field the database fills", (ctx) =>
      searched(
        ctx,
        Effect.gen(function* filledRuns() {
          const directory = yield* scratchDirectory("genetic-filled-");
          const bench = { directory, grammar, laws };

          return yield* exhaust(
            {
              /**
               * A cp:variant's and a cp:dependency's identifierref one byte past the key-text
               * bound, and the variant's at the bound, each judged once.
               */
              box: "an identifierref one byte past the key-text bound, and one at it",
              caseHang: Duration.minutes(5),
              coverage: noCoverage,
              generator: int(0, filledCases.length - 1),
              literal: (at) => filledCases[at]?.name ?? String(at),
              /**
               * A second implementation, the law oracle, against the laws the import's rows hold on
               * the host.
               */
              oracle: {
                kind: "second-implementation",
                name: "the law oracle against the laws the import's rows hold on the host",
              },
              suite: "pantry/genetic-filled-key-text",
            },
            (at) =>
              Effect.gen(function* filledCase() {
                const held = filledCases[at];
                assert.isDefined(held, `no filled case ${String(at)}`);

                const manifest = new TextEncoder().encode(held.manifest);
                const genome = yield* genomeOf(new Map([["imsmanifest.xml", manifest]]));
                const judged = yield* judgeOne(genome, bench, at);
                assert.isFalse(
                  judged.disagreements.some((disagreement) =>
                    recordsClassOf([keyTextBound], disagreement),
                  ),
                  `${held.name}: the oracle says ${judged.summary.oracle}, the import's rows ${judged.summary.import}`,
                );
              }),
          );
        }).pipe(Effect.scoped),
      ),
    );

    /**
     * Oracle: the replay's two readings of a signature, `recordsClassOf` as keyed and
     * `recordsPlainClassOf` by plain class. Bound: a fixed signature keyed by a limit, against
     * its class under that limit, under another and under none, and against another law.
     */
    const plainReplay = Effect.sync(() => {
      const plain: Signature = { kind: "oracle-only-law", law: "Key text bound" };
      const keyed: Signature = { ...plain, limit: "an inclusion cycle" };

      assert.isTrue(showsClass(keyed, false, disagreementOf(keyed)), "under its own limit");
      assert.isTrue(
        showsClass(keyed, false, disagreementOf({ ...plain, limit: "a forbidden ancestor" })),
        "under another limit",
      );
      assert.isTrue(showsClass(keyed, false, disagreementOf(plain)), "under no limit");
      assert.isFalse(
        showsClass(
          keyed,
          false,
          disagreementOf({
            kind: "oracle-only-law",
            law: "Record field key",
            limit: "an inclusion cycle",
          }),
        ),
        "another law under its limit",
      );
      assert.isFalse(
        showsClass(keyed, true, disagreementOf(plain)),
        "a known entry is keyed by its limit",
      );
    });

    it.effect(
      "replays a fixed entry by its plain class, whatever stated limit its key carries",
      () => plainReplay,
    );

    /**
     * Oracle: the replay's reading of a signature against the disagreement of that signature
     * (`disagreementOf`), which an entry must recognize, or its replay can never fail. Bound:
     * every known and fixed entry.
     */
    const ownClasses = Effect.sync(() => {
      assert.deepStrictEqual(
        knownList.flatMap(({ entry, shows }) =>
          showsClass(entry.signature, shows, disagreementOf(entry.signature))
            ? []
            : [shownSignature(entry.signature)],
        ),
        [],
        "the replay does not recognize these entries' own class, so a known entry is always stale and a fixed one guards nothing",
      );
    });

    it.effect(
      "replays each known and fixed entry's own class as a class it records",
      () => ownClasses,
    );

    /**
     * Oracle: the two tables' classes, by sameSignature. Bound: every known and fixed entry's
     * signature.
     */
    const oneTable = Effect.sync(() => {
      assert.deepStrictEqual(
        known
          .filter(({ signature }) =>
            fixed.some((entry) => sameSignature(entry.signature, signature)),
          )
          .map(({ signature }) => shownSignature(signature)),
        [],
        "these signatures key a known entry and a fixed one, so the known entry hides the fixed cause if it shows again; key the known class by the stated limit it falls under (#pantry/test/gen/genetic/judge.ts limitOf), or move it",
      );
    });

    it.effect("keys no signature in both the known and the fixed table", () => oneTable);

    /**
     * Oracle: grizzle's sameLaw against the laws the host judges. Bound: every known and fixed
     * entry's signature, and one unshowable signature of each shape.
     */
    const showable = Effect.sync(() => {
      assert.deepStrictEqual(
        unshowable.values().filter(canShow).map(shownSignature).toArray(),
        [],
        "the guard admits a signature no package can show",
      );
      assert.deepStrictEqual(
        knownList.flatMap(({ entry }) =>
          canShow(entry.signature) ? [] : [shownSignature(entry.signature)],
        ),
        [],
        "these signatures key a law the host does not judge, which no statement of Qti states, so they can never show and their entries guard nothing; plant the behaviour each entry's fix removed, judge its package, and rekey it to the signature that shows, or delete it where none can",
      );
    });

    it.effect("keys every known and fixed entry by a class some package can show", () => showable);

    it.effect(
      "disagrees on each planted value outside its domain's facets exactly while it waits on a fix",
      (ctx) =>
        searched(
          ctx,
          Effect.gen(function* plantedRuns() {
            const directory = yield* scratchDirectory("genetic-planted-");
            const bench = { directory, grammar, laws };

            return yield* exhaust(
              {
                /**
                 * The three planted cases, each judged once.
                 */
                box: "the three planted values outside their domain's facets",
                caseHang: Duration.minutes(5),
                coverage: noCoverage,
                generator: int(0, plantedCases.length - 1),
                literal: (at) => plantedCases[at]?.name ?? String(at),
                /**
                 * A second implementation, the law oracle, against the laws the import's rows hold
                 * on the host.
                 */
                oracle: {
                  kind: "second-implementation",
                  name: "the law oracle against the laws the import's rows hold on the host",
                },
                suite: "pantry/genetic-planted-domains",
              },
              (at) =>
                Effect.gen(function* plantedCase() {
                  const planted = plantedCases[at];
                  assert.isDefined(planted, `no planted case ${String(at)}`);

                  const judged = yield* judgeOne(yield* genomeOf(planted.entries), bench, at);
                  const domains = judged.disagreements.filter(
                    (disagreement) =>
                      (disagreement.kind === "oracle-only-law" ||
                        disagreement.kind === "import-only-law") &&
                      disagreement.law === "value domain",
                  );
                  const sides = `the oracle says ${judged.summary.oracle}, the import's rows ${judged.summary.import}`;
                  if (Option.isSome(planted.waits)) {
                    const { fix, owner } = planted.waits.value;
                    assert.isNotEmpty(
                      domains,
                      `stale: ${planted.name} no longer disagrees, which waits on ${owner}'s fix (${fix}); drop its wait in #pantry/test/gen/genetic/planted.ts in the fix's commit (${sides})`,
                    );
                  } else {
                    assert.deepStrictEqual(
                      domains.map(shownDisagreement),
                      [],
                      `${planted.name}: ${sides}`,
                    );
                  }
                }),
            );
          }).pipe(Effect.scoped),
        ),
    );

    it.effect.skipIf(!settings.geneticRequested)(
      "breeds no package the two judge differently, but as known",
      (ctx) =>
        searched(
          ctx,
          Effect.gen(function* searchRuns() {
            const corpus = yield* corpusOf(grammar);
            const directory = yield* scratchDirectory("genetic-");
            const bench = { directory, grammar, laws };

            return yield* explore(
              {
                caseHang: Duration.minutes(20),
                coverage: noCoverage,
                draw: steered(
                  (steering) => (source) => ({
                    rotating: Option.isNone(steering),
                    run: source.draw(runSketch),
                  }),
                  (drawnRun) => drawnRun,
                ),
                kept: [],
                literal: (drawnRun) =>
                  `{ run: ${runLiteral(drawnRun.run)}, rotating: ${String(drawnRun.rotating)} }`,
                /**
                 * A second implementation, the law oracle, against readProgram's refusal and the
                 * laws its rows hold on the host.
                 */
                oracle: {
                  kind: "second-implementation",
                  name: "the law oracle against readProgram's refusal and its rows' host laws",
                },
                /**
                 * Per run, the budget above, each candidate one to its most edits from a parent of
                 * the corpus or of the run's population, every other one judged beside a noised
                 * copy.
                 */
                runs: chosen.runs,
                shrink: boundedShrink(0),
                steerEvery: 1,
                suite: "pantry/genetic-differential",
              },
              ({ run: sketch, rotating }, c) =>
                Effect.gen(function* oneRun() {
                  const report = yield* hunt(
                    corpus,
                    bench,
                    chosen.budget,
                    chosen.tries,
                    recorded,
                    sketch,
                    chosen.isolating,
                  );
                  c.noteAll(report.evolved.features.keys());
                  for (const law of report.isolation.alone) {
                    tally.isolation.alone.add(law);
                  }

                  for (const [law, count] of report.isolation.raised) {
                    tally.isolation.raised.set(law, (tally.isolation.raised.get(law) ?? 0) + count);

                    const now = report.isolation.beside.get(law) ?? new Set<string>();
                    const held = tally.isolation.beside.get(law);
                    tally.isolation.beside.set(
                      law,
                      new Set(
                        held === undefined ? now : [...now].filter((other) => held.has(other)),
                      ),
                    );
                  }
                  if (rotating) {
                    tally.rotatingRuns += 1;
                    for (const feature of report.evolved.features.keys()) {
                      tally.acrossRuns.set(feature, (tally.acrossRuns.get(feature) ?? 0) + 1);
                    }
                  }

                  const unrecorded = report.reduced.filter(({ signature }) =>
                    recorded.every((held) => !sameSignature(held, signature)),
                  );
                  console.log(
                    `genetic run ${runLiteral(sketch)}: ${shownResidual(report)}; ${String(report.reduced.length - unrecorded.length)} known classes met`,
                  );
                  assert.deepStrictEqual(
                    unrecorded.map(({ signature }) => shownSignature(signature)),
                    [],
                    `the import's host path and the law oracle disagree in classes no known entry records:\n\n${shownReport({ ...report, reduced: unrecorded })}`,
                  );
                }),
            );
          }).pipe(Effect.scoped),
        ),
    );
  },
);
