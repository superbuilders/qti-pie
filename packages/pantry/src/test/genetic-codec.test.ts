/* oxlint-disable unicorn/text-encoding-identifier-case -- The codec search spells encoding labels (`UTF-8`, `UTF-16LE`) as XML 1.0 section 4.3.3 and crust's trees spell them: they are the data under test, not names passed to a Node encoding API. */
/**
 * The codec's genetic search: documents bred as their source's intentions (an XML declaration, a
 * doctype with its subsets, entities, attribute defaults, character and entity references, CDATA,
 * namespaces, deep nesting, eight charsets), judged by six independent oracles
 * (`#pantry/test/gen/genetic/codec-judge.ts`): libxml2's reader against crust's (O1), crust's
 * write-and-read cycle and Node's decoder on its bytes (O2), libxml2's canonical XML against
 * crust's (O3), the codec's round trip, shred, unshred, read and shred again (O4), crust's decoder
 * against Node's (O5), and the references crust keeps against libxml2's (O6).
 *
 * Oracle: second implementations (libxml2's `xmllint`, its reader and its `--c14n`; Node's WHATWG
 * decoders) and universal ones (crust's cycle, the codec's round trip under the equality its
 * contract states: the same rows as sets, the same canonical form, and each element's declarations
 * and attributes in Canonical XML's order).
 *
 * Search: GEN-A's engine (`#pantry/test/gen/genetic/engine.ts`), a population seeded by
 * construction (the XDM generator's QTI documents and small generic documents with internal
 * subsets), parents picked by novelty over the features of `codec-genome.ts` and the oracles'
 * outcomes, bred by the edits of `codec-genome.ts` under weights each run draws, swarm-style. A
 * free run, `pnpm test`, searches the floor stream alone, which its label fixes, so it breeds the
 * same documents every run and a lucky seed cannot turn it red; it replays every kept and every
 * fixed document beside. `QTI_PIE_GENETIC=1` adds the stream the run's seed rotates, which
 * explores, and multiplies the budget: a class only it finds is recorded or routed from that run.
 *
 * Every disagreement fails the test unless {@link recorded} or {@link open} names its class.
 * {@link recorded} holds the classes where libxml2 2.15.2, not crust, departs from the
 * specification, each with its source. {@link open} holds confirmed defects, each routed to its
 * owner and kept by the reduced documents that show it, which must still show it, so an entry
 * cannot outlive its fix. {@link fixed} holds the defects since closed, their documents kept as
 * planted seeds that every oracle must pass.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, layer } from "@effect/vitest";
import { Console, Effect, Layer, Option } from "effect";
import { floorSeed, rotatingSeed } from "@bjornpagen/testing/random";
import { sample } from "@bjornpagen/testing/source";
import { runOfProcess } from "@bjornpagen/testing/vitest/run";
import { shredGrammarOf } from "#pantry/model/composed.ts";
import { names } from "#pantry/model/names.ts";
import { toXmlDocument } from "#pantry/model/unshred.ts";
import {
  encodedIn,
  evenWeights,
  genericGenome,
  genomeOfTree,
  mutationOf,
  reversedAttributes,
  smallerOf,
  sourceText,
  weightsOf,
} from "#pantry/test/gen/genetic/codec-genome.ts";
import type { Charset, CodecGenome } from "#pantry/test/gen/genetic/codec-genome.ts";
import { featureFamily, judgeBytes, judgeOf } from "#pantry/test/gen/genetic/codec-judge.ts";
import type { CodecDisagreement, CodecWorld } from "#pantry/test/gen/genetic/codec-judge.ts";
import { evolve, reduce } from "#pantry/test/gen/genetic/engine.ts";
import type { Budget, Evolved, Found } from "#pantry/test/gen/genetic/engine.ts";
import { xdmDocument } from "#pantry/test/gen/xdm.ts";
import { fileScratchDirectory } from "#pantry/test/scratch.ts";
import { settings } from "#pantry/test/settings.ts";
import { OracleLayer, requireRecordsLibxml2 } from "#pantry/xml/oracle.ts";
import { grammar } from "#pantry/grammar/install.ts";

/**
 * A document a table keeps by value: its text and the charset it is encoded in.
 */
interface Kept {
  readonly charset: Charset;
  readonly text: string;
}

/**
 * A class of disagreement that is no defect of crust or the codec: libxml2 2.15.2 departs from
 * the specification there, or the input itself is at fault. Matched by its signature; never
 * stale, as `xsd.corpus.test.ts` keeps its libxml2 records, and derived again whenever the
 * oracle's libxml2 moves (`recordsLibxml2` of `#pantry/xml/oracle.ts`).
 */
interface Recorded {
  readonly signature: RegExp;
  readonly source: string;
  readonly why: string;
}

/**
 * The classes where libxml2, not crust, departs from the specification, or where the input is.
 */
const recorded: readonly Recorded[] = [
  {
    signature: /^O1 encoding declared against the bytes: crust refuses, libxml2 accepts$/u,
    source:
      'XML 1.0 (Fifth Edition) section 4.3.3: "it is a fatal error for an entity including an encoding declaration to be presented to the XML processor in an encoding other than that named in the declaration, or for an entity which begins with neither a Byte Order Mark nor an encoding declaration to use an encoding other than UTF-8", and "Entities encoded in UTF-16 MUST ... begin with the Byte Order Mark", the terms "UTF-8" and "UTF-16" not applying "to related character encodings, including but not limited to UTF-16BE, UTF-16LE"; Unicode 16.0 section 3.10, D96 and D97, and RFC 2781 sections 4.1 and 4.2: under UTF-16BE or UTF-16LE an initial FE FF or FF FE is U+FEFF, a character',
    why: 'a document in another encoding than its declaration names, or than UTF-8 where it names none, is refused by crust under encoding-mismatch (decode.ts): a UTF-16 mark under UTF-16LE or UTF-16BE, a UTF-8 mark under another label, an Appendix F UTF-16 pattern with no mark under UTF-16, under UTF-8 or under no label; libxml2 2.15.2 reads a UTF-16 mark or pattern in the encoding its first bytes say, and a UTF-8 mark in UTF-8 under a single-byte label, warning at most that the label "doesn\'t match auto-detected" one',
  },
  {
    signature: /^O1 crust refused-entity-cycle, libxml2 accepts(?: after an xml:id error)?$/u,
    source:
      'XML 1.0 (Fifth Edition) section 4.1, WFC No Recursion: "A parsed entity MUST NOT contain a recursive reference to itself, either directly or indirectly"',
    why: 'a ring of internal entities is a well-formedness error whether or not the body references it, as the constraint is on the entity; crust refuses the ring where it is declared (dtd.ts), libxml2 2.15.2 only on expanding it ("Detected an entity reference loop")',
  },
  {
    signature: /^O1 namespace name holds a reference: crust accepts, libxml2 refuses: .+$/u,
    source:
      'XML 1.0 (Fifth Edition) section 4.4.3: a processor that does not include an entity\'s replacement text "MUST inform the application that it recognized, but did not read, the entity"',
    why: "a namespace declaration whose value references an entity only the unread external subset may declare has an unknown namespace name; libxml2 2.15.2 reads the reference as empty text and then refuses an empty prefixed namespace name or a URI it makes of the rest; crust keeps the reference, and shred refuses the declaration under namespace-entity",
  },
  {
    signature: /^O5 UTF-16 input ends inside a surrogate pair: .+$/u,
    source:
      'XML 1.0 (Fifth Edition) section 4.3.3: "It is a fatal error if an XML entity is determined ... to be in a certain encoding but contains byte sequences that are not legal in that encoding"; section 2.2, [2] Char excludes the surrogate blocks',
    why: "a UTF-16 document whose last code unit is a high surrogate no low one follows, or half a code unit, holds a sequence UTF-16 does not, so what an independent decoder makes of it is the input's fault, not crust's; crust's fatal decoder refuses it (decode.ts), as libxml2 2.15.2 does (\"Invalid bytes in character encoding\"), so O1 agrees but after an xml:id error, which the last record holds",
  },
  {
    signature: /^O\d default names an entity declared after it: .+$/u,
    source:
      "XML 1.0 (Fifth Edition) section 4.1: WFC and VC Entity Declared both say \"The declaration of a general entity MUST precede any reference to it which appears in a default value in an attribute-list declaration\"; outside the WFC's scope sections 4.4 and 5.1 leave the default's value undetermined",
    why: "crust refuses a forward reference in a default everywhere: inside the WFC's scope as not well-formed, outside it as an invalid document whose default has no value the specification fixes (the coordinator's ruling 5: refuse where the infoset is undetermined); libxml2 2.15.2 reads such a default as the empty string, its own choice, with a warning that the entity is not defined",
  },
  {
    signature:
      /^O1 (?:UTF-16 input ends inside a surrogate pair: )?crust refused-(?:decode|well-formedness \((?:text data outside of root node\.|documents may contain only one root\.)\)), libxml2 accepts after an xml:id error$/u,
    source:
      "XML 1.0 (Fifth Edition) section 2.1, [1] document ::= prolog element Misc*, and section 4.3.3, which makes bytes not legal in the entity's encoding a fatal error; xml:id 1.0 section 6: an xml:id error is non-fatal, so it leaves both rules standing",
    why: "after an xml:id that is no NCName, libxml2 2.15.2 never checks the end of the document: the xml:id error (SAX2.c xmlErrId) sets the parser's errNo, and xmlParserCheckEOF returns while errNo holds an error (parserInternals.c:664-669), so content after the root element, a second root and an input that ends inside a character all pass with exit 0; crust refuses each, as the WFC and section 4.3.3 require",
  },
];

/**
 * One confirmed defect a class of disagreement stands for, until its fix lands: the class's
 * pattern, the finding that confirmed it, why it is a defect against the specification, and the
 * reduced documents the search found it with, kept by value. Each kept document must still show a
 * disagreement of the class, so an entry cannot outlive its fix.
 */
interface Open {
  readonly finding: string;
  readonly kept: readonly Kept[];
  readonly signature: RegExp;
  readonly why: string;
}

/**
 * The confirmed defects whose classes the search finds today, each routed to its owner through
 * GEN-B's report; none is harmless.
 */
const open: readonly Open[] = [];

/**
 * A planted seed of a fixed defect: a document the search showed it with, and the one
 * disagreement it shows once fixed, where the libxml2 the records hold departs from the
 * specification on it.
 */
interface Planted extends Kept {
  /**
   * The signature of the {@link recorded} class the seed shows on that libxml2, `recordsLibxml2`
   * of `#pantry/xml/oracle.ts`. There libxml2 accepts what the fixed crust refuses, so O1 no
   * longer witnesses the fix by agreeing; the seed witnesses it by showing the departure, which
   * only crust's refusal makes, and a crust that regressed agrees with libxml2 and shows none.
   */
  readonly departs?: string;
}

/**
 * A defect the search found and its fix closed: the finding, the commit that fixed it, and the
 * reduced documents that showed it, kept as planted seeds, each of which every oracle must now
 * pass but for the libxml2 departure it records.
 */
interface Fixed {
  readonly commit: string;
  readonly finding: string;
  readonly kept: readonly Planted[];
}

/**
 * The defects closed since the search found them.
 */
const fixed: readonly Fixed[] = [
  {
    commit:
      "the commit that holds a namespace declaration's value to RFC 3986's URI-reference, or to RFC 3987's IRI-reference in an XML 1.1 document",
    finding: "GEN-B/codec N2: a namespace name that was no URI reference was accepted",
    kept: [{ charset: "UTF-8", text: '<r xmlns:p="&quot;"/>' }],
  },
  {
    commit:
      "the commit that resolves namespaces in crust after the attribute-list defaults are added",
    finding: "GEN-B/codec N1: an attribute-list default was added with no namespace processing",
    kept: [
      { charset: "UTF-8", text: '<!DOCTYPE r [<!ATTLIST r xml:space NMTOKENS "">]><r/>' },
      { charset: "UTF-8", text: '<!DOCTYPE r [<!ATTLIST r p:a IDREF "">]><r/>' },
      { charset: "UTF-8", text: '<!DOCTYPE r [<!ATTLIST r xmlns CDATA "urn:d">]><r/>' },
      {
        charset: "UTF-8",
        text: '<!DOCTYPE r [<!ATTLIST r xml:space CDATA "x"><!ATTLIST r b CDATA "y">]><r/>',
      },
    ],
  },
  {
    commit:
      "the commit that reads a document's encoding as a row of Appendix F.1, refuses a label the row rules out, and writes UTF-16LE and UTF-16BE with no byte order mark",
    finding:
      "GEN-B/codec N3: a declaration naming another encoding than the one the bytes are in was accepted",
    // libxml2 2.15.2 reads each in the encoding its first bytes say, the UTF-16BE pattern and the
    // UTF-8 mark, and accepts it with a warning that "Encoding 'UTF-16LE' doesn't match
    // auto-detected" one, so each shows the recorded class O1 names a crust refusal by.
    kept: [
      {
        charset: "UTF-16BE",
        departs: "O1 encoding declared against the bytes: crust refuses, libxml2 accepts",
        text: '<?xml version="1.0" encoding="UTF-16LE"?><!DOCTYPE r><r/>',
      },
      {
        charset: "UTF-8 BOM",
        departs: "O1 encoding declared against the bytes: crust refuses, libxml2 accepts",
        text: '<?xml version="1.0" encoding="UTF-16LE"?><r/>',
      },
    ],
  },
  {
    commit:
      "the commit that reads a document's encoding as a row of Appendix F.1, refuses a label the row rules out, and writes UTF-16LE and UTF-16BE with no byte order mark",
    finding: "GEN-B/codec N4: a UTF-16LE or UTF-16BE document was written with a byte order mark",
    kept: [{ charset: "UTF-16BE", text: '<?xml version="1.0" encoding="UTF-16BE"?><r/>' }],
  },
  {
    commit:
      "the commit that lexes a declaration after an unread parameter entity without processing it",
    finding:
      "GEN-B/codec N6: after an unread parameter entity, the internal subset's declarations went unchecked",
    kept: [
      { charset: "UTF-8", text: '<!DOCTYPE r [%f;<!ATTLIST r a CDATA "<">]><r/>' },
      { charset: "UTF-8", text: '<!DOCTYPE r [%f;<!ENTITY e "x&">]><r/>' },
      {
        charset: "UTF-8",
        text: '<!DOCTYPE r SYSTEM "doc.dtd" [%f;<!ATTLIST r a IDREF "&#x1;">]><r/>',
      },
    ],
  },
  {
    commit: "the commit that holds the subset's processing instructions to [16] and [17]",
    finding:
      "GEN-B/codec N5: a reserved processing-instruction target was accepted in the internal subset",
    kept: [
      { charset: "UTF-8", text: "<!DOCTYPE r [<?XmL d?>]><r/>" },
      { charset: "UTF-8", text: "<!DOCTYPE r [<?ta?b?>]><r/>" },
    ],
  },
  {
    commit: "the commit that binds xml in canonical.ts's outermost scope",
    finding: "GEN-B/codec N7: crust's canonical form rendered the declaration of the xml prefix",
    kept: [
      { charset: "UTF-8", text: '<r xmlns:xml="http://www.w3.org/XML/1998/namespace"/>' },
      {
        charset: "UTF-8",
        text: '<r xmlns:xml="http://www.w3.org/XML/1998/namespace"><a xml:lang="en"/></r>',
      },
    ],
  },
];

/**
 * The QTI seeds: the XDM generator's documents, on a stream this label fixes, so shred admits
 * the population's QTI members and O4 has trees to round-trip. Every other seed writes each
 * element's attributes in the reverse of the generator's order, as an author may write them in
 * any order (XML 1.0 section 3.1: the order of attribute specifications is not significant), so
 * the codec meets unsorted attributes from the start.
 */
const qtiSeeds: readonly CodecGenome[] = sample(
  xdmDocument(grammar),
  floorSeed("pantry/genetic-codec/qti-seeds"),
  48,
).map(({ document }, at) => {
  const written = genomeOfTree(toXmlDocument(document, names));
  const genome = at % 2 === 1 ? reversedAttributes(written) : written;

  return document.prolog.some(({ _tag }) => _tag === "doctype")
    ? {
        ...genome,
        doctype: Option.some({ external: true, name: genome.root.name, subset: Option.none() }),
      }
    : genome;
});

/**
 * The generic seeds: small documents with internal subsets, built by construction.
 */
const genericSeeds: readonly CodecGenome[] = sample(
  genericGenome,
  floorSeed("pantry/genetic-codec/generic-seeds"),
  64,
);

/**
 * How much more a run under `QTI_PIE_GENETIC=1` breeds than a free one.
 */
const longFactor = 25;

/**
 * Each stream's budget: generations of 48, three edits at most per child, 48 seeds drawn from the
 * 112 first; 384 children in a free run.
 */
const budget: Budget = {
  candidates: settings.geneticRequested ? 384 * longFactor : 384,
  edits: 3,
  generation: 48,
  initial: 48,
};

/**
 * The most candidates one disagreement's reduction judges: a few dozen in a free run, which
 * removes the large cuts, and enough for a minimal case under `QTI_PIE_GENETIC=1`.
 */
const reductionTries = settings.geneticRequested ? 400 : 30;

/**
 * The folder each stream writes its documents to, `work/genetic-codec-*`, the run's own.
 */
const scratch = fileScratchDirectory("genetic-codec-");

/**
 * The judge's world for the kept documents.
 */
const keptWorld: CodecWorld = {
  concurrency: 1,
  directory: scratch,
  grammar: shredGrammarOf(grammar),
  names,
};

/**
 * The services the search reads, writes and spawns with.
 */
const TestLayer = Layer.mergeAll(
  NodeServices.layer,
  OracleLayer.pipe(Layer.provideMerge(NodeServices.layer)),
);

/**
 * One stream's search: its name, what the engine found, and each class of disagreement with the
 * first candidate that showed it and that candidate reduced.
 */
interface Searched {
  readonly evolved: Evolved<CodecGenome, string, CodecDisagreement>;
  readonly label: string;
  readonly reduced: readonly {
    readonly found: Found<CodecGenome, CodecDisagreement>;
    readonly genome: CodecGenome;
    readonly signature: string;
  }[];
}

/**
 * Run one stream's search and reduce each class of disagreement it found.
 *
 * @param label - The stream's name, for its folder and its report.
 * @param seed - The stream's seed.
 * @returns What the search found, and each class's reduced genome.
 */
const searched = Effect.fnUntraced(function* searched(label: string, seed: number) {
  const world: CodecWorld = {
    concurrency: 8,
    directory: `${scratch}/${label}`,
    grammar: shredGrammarOf(grammar),
    names,
  };
  const judge = judgeOf(world);
  const [weights = evenWeights] = sample(
    weightsOf,
    rotatingSeed(seed, floorSeed("pantry/genetic-codec/weights")),
    1,
  );
  const evolved: Evolved<CodecGenome, string, CodecDisagreement> = yield* evolve(
    {
      familyOf: featureFamily,
      judge,
      mutate: mutationOf(weights),
      seeds: [...qtiSeeds, ...genericSeeds],
      signatureOf: ({ signature }) => signature,
    },
    budget,
    seed,
  );
  const reducedWorld: CodecWorld = { ...world, directory: `${world.directory}/reduce` };
  const reduced = yield* Effect.forEach([...evolved.found], ([signature, found]) =>
    Effect.map(
      reduce(
        found.genome,
        smallerOf,
        (genomes) =>
          Effect.map(judgeOf(reducedWorld)(genomes), (judgments) =>
            judgments.map(({ disagreements }) =>
              disagreements.some((held) => held.signature === signature),
            ),
          ),
        [...recorded, ...open].some((entry) => entry.signature.test(signature)) &&
          !settings.geneticRequested
          ? 0
          : reductionTries,
        reducedWorld.concurrency,
      ),
      ({ genome }) => ({ found, genome, signature }),
    ),
  );

  return { evolved, label, reduced } satisfies Searched;
});

/**
 * Write a stream's report: its residuals per feature family and each class it found, reduced.
 *
 * @param run - The stream's search.
 * @returns The report's lines.
 */
const reportOf = (run: Searched): readonly string[] => [
  `genetic-codec ${run.label}: ${String(run.evolved.evaluated)} judged, population ${String(run.evolved.population)}, ${String(run.evolved.features.size)} features, ${String(run.evolved.found.size)} classes of disagreement`,
  ...run.evolved.residual.map(
    ({ candidates, estimate, family, observed, singletons }) =>
      `  residual ${family}: ${String(observed)} features, ${String(singletons)} seen once over ${String(candidates)} candidates, Good-Turing ${estimate.toFixed(4)}`,
  ),
  `  outcomes: ${[...run.evolved.features]
    .filter(([feature]) => /^(?:o\d|codec) /u.test(feature))
    .toSorted(([left], [right]) => (left < right ? -1 : 1))
    .map(([feature, count]) => `${feature} (${String(count)})`)
    .join("; ")}`,
  ...run.reduced.map(
    ({ found, genome, signature }) =>
      `  ${signature}\n    lineage: ${found.lineage.join("; ")}\n    detail: ${found.disagreement.detail.slice(0, 500)}\n    reduced: ${JSON.stringify(sourceText(genome))} (${genome.charset})`,
  ),
];

describe("genetic-codec.test.ts", () => {
  layer(TestLayer, { excludeTestServices: true })("the codec's genetic search", (it) => {
    it.effect(
      "crust agrees with libxml2, and crust's cycle and the codec's round trip keep every bred document",
      () =>
        Effect.gen(function* codecSearch() {
          yield* requireRecordsLibxml2();

          const run = yield* runOfProcess;
          const floor = yield* searched("floor", floorSeed("pantry/genetic-codec"));
          const streams = settings.geneticRequested
            ? [
                floor,
                yield* searched(
                  "rotating",
                  rotatingSeed(run.seed, floorSeed("pantry/genetic-codec")),
                ),
              ]
            : [floor];
          yield* Console.log(
            [`genetic-codec: TEST_SEED=${String(run.seed)}`, ...streams.flatMap(reportOf)].join(
              "\n",
            ),
          );

          const accounted = (signature: string): boolean =>
            [...recorded, ...open].some((entry) => entry.signature.test(signature));
          const unopened = streams.flatMap(({ label, reduced }) =>
            reduced
              .filter(({ signature }) => !accounted(signature))
              .map(
                ({ found, genome, signature }) =>
                  `${label}: ${signature}: ${found.disagreement.detail.slice(0, 300)} (reduced: ${JSON.stringify(sourceText(genome))})`,
              ),
          );
          const kept = open.flatMap((entry) => entry.kept.map((held) => ({ entry, held })));
          const keptJudged = yield* Effect.forEach(
            kept,
            ({ entry, held }, at) =>
              judgeBytes(
                encodedIn(held.text, held.charset),
                `${scratch}/kept-${String(at)}.xml`,
                keptWorld,
              ).pipe(
                Effect.map(({ disagreements }) => ({
                  entry,
                  held,
                  shows: disagreements.some(({ signature }) => entry.signature.test(signature)),
                })),
              ),
            { concurrency: 1 },
          );
          const stale = keptJudged.filter(({ shows }) => !shows);
          const seeds = fixed.flatMap((entry) => entry.kept.map((held) => ({ entry, held })));
          const regressed = yield* Effect.forEach(
            seeds,
            ({ entry, held }, at) =>
              judgeBytes(
                encodedIn(held.text, held.charset),
                `${scratch}/fixed-${String(at)}.xml`,
                keptWorld,
              ).pipe(
                Effect.map(({ disagreements }) => {
                  const shown = disagreements.map(({ signature }) => signature);
                  const departs = Option.toArray(Option.fromUndefinedOr(held.departs));

                  return shown.join("\n") === departs.join("\n")
                    ? []
                    : [
                        `${entry.finding}: ${JSON.stringify(held.text)} (${held.charset}): ${shown.join(" + ") || "no disagreement"}, where it shows ${departs.join(" + ") || "none"}`,
                      ];
                }),
              ),
            { concurrency: 1 },
          );

          assert.deepStrictEqual(
            unopened,
            [],
            "every disagreement the search finds is a confirmed, routed defect",
          );
          assert.deepStrictEqual(
            stale.map(
              ({ entry, held }) =>
                `${entry.finding}: ${JSON.stringify(held.text)} (${held.charset})`,
            ),
            [],
            "every kept document still shows its routed defect",
          );
          assert.deepStrictEqual(
            regressed.flat(),
            [],
            "every planted seed of a fixed defect passes every oracle but the libxml2 departure it records",
          );
          assert.deepStrictEqual(
            seeds.flatMap(({ held }) =>
              held.departs === undefined ||
              recorded.some(({ signature }) => signature.test(held.departs ?? ""))
                ? []
                : [held.departs],
            ),
            [],
            "every departure a planted seed records is a recorded class",
          );
        }),
    );
  });
});
