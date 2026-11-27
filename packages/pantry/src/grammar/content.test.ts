import { assert, beforeAll, describe, it } from "@effect/vitest";
import { shuffled } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { floorSeed, rotatingSeed } from "@bjornpagen/testing/random";
import { sample } from "@bjornpagen/testing/source";
import { runOfProcess } from "@bjornpagen/testing/vitest/run";
import { Effect, FileSystem, Option } from "effect";
import { composed } from "#pantry/grammar/compose.ts";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import { documentLayer, openVocabulary, vocabularyFacets } from "#pantry/grammar/facets.ts";
import { foreignKinds } from "#pantry/grammar/kinds.ts";
import { xsdDirectory } from "#pantry/vocab/derive/sources.ts";
import { mathmlNamespace, vocabularyNamespaces } from "#pantry/vocab/namespaces.ts";
import type { SourcePath } from "#pantry/vocab/derive/sources.ts";
import {
  acceptorOf,
  resolverOf,
  elementsOf,
  loadXsd,
  XsdOracleLayer,
  xsdContents,
} from "#pantry/test/gen/grammar.ts";
import { accepts, admittedOf, arityOf, countBoundsOf } from "#pantry/test/indexes.ts";
import type { Content, Particle, XsdSet } from "#pantry/test/gen/grammar.ts";
import { relaxNgModels, semanticsContexp } from "#pantry/test/gen/relaxng.ts";
import type { MathClasses } from "#pantry/test/gen/relaxng.ts";
import { xsdCachePresent } from "#pantry/test/xsd-catalog.ts";

/**
 * The composed grammar of production, failing the test that reads it when a generator refuses.
 */
const grammar = Effect.fromResult(composed());

/**
 * Each pinned schema set this file reads, with its contents under the composed grammar's
 * resolution, read on the file's first ask and held for the rest: the differentials below walk the
 * same few roots, and reading an ASI set takes seconds.
 */
const schemaReadings = new Map<
  SourcePath,
  { readonly contents: ReadonlyMap<string, readonly Content[]>; readonly set: XsdSet }
>();

/**
 * A pinned schema set and its contents under the composed grammar's resolution, read once a file.
 *
 * @param root - The schema set's root file.
 * @returns The set and its contents.
 */
const readingOf = Effect.fn("test.readingOf")(function* readingOf(root: SourcePath) {
  const held = schemaReadings.get(root);
  if (held !== undefined) {
    return held;
  }

  const { kinds } = yield* grammar;
  const { set } = yield* loadXsd(root);
  const reading = { contents: xsdContents(set, resolverOf(kinds)).contents, set };
  schemaReadings.set(root, reading);

  return reading;
});

/**
 * One at-most-one assert of the loose LOM binding's embedded Schematron: the kind of its rule's
 * context, the kind it caps there, and its line in `lom/imsmd_loose_v1p3p2.xsd`.
 */
interface SchematronCap {
  readonly child: string;
  readonly line: number;
  readonly parent: string;
}

/**
 * Read the loose LOM binding's Schematron from the binding's own text, apart from every reader and
 * from the facets (spec reading `lom-repetition`): each rule's context, an absolute path from
 * `lom:lom`, resolved step by step to the kind of its last step, and each assert `count(lom:X) = 0
 * or count(lom:X) = 1` as the kind `X` names there. A rule whose path resolves to no kind, an
 * assert of another form and an assert whose element resolves to no kind are each reported as
 * unread.
 *
 * @param composedGrammar - The grammar whose kinds the names resolve to.
 * @returns The caps, and each line read as neither.
 */
const schematronCaps = (composedGrammar: ComposedGrammar) =>
  Effect.gen(function* readSchematron() {
    const fs = yield* FileSystem.FileSystem;
    const directory = yield* xsdDirectory;
    const text = yield* fs.readFileString(`${directory}/lom/imsmd_loose_v1p3p2.xsd`);
    const resolve = resolverOf(composedGrammar.kinds);
    const lom = vocabularyNamespaces.lom.namespace;
    const caps: SchematronCap[] = [];
    const unread: string[] = [];
    let context: Option.Option<string> = Option.none();
    for (const [index, line] of text.split("\n").entries()) {
      const rule = /<sch:rule\b[^>]*\bcontext="(?<path>[^"]*)"/u.exec(line)?.groups?.["path"];
      const test = /<sch:assert\b[^>]*\btest="(?<test>[^"]*)"/u.exec(line)?.groups?.["test"];
      if (rule !== undefined) {
        context = Option.some("document");
        for (const step of rule.split("/")) {
          context = context.pipe(
            Option.flatMap((held) =>
              step.startsWith("lom:") ? resolve(lom, step.slice(4), held) : Option.none(),
            ),
          );
        }

        if (Option.isNone(context)) {
          unread.push(`line ${String(index + 1)}: ${rule}`);
        }
      } else if (test !== undefined) {
        const name = /^count\(lom:(?<name>[A-Za-z]+)\) = 0 or count\(lom:\k<name>\) = 1$/u.exec(
          test,
        )?.groups?.["name"];
        const capped = Option.all({ name: Option.fromNullishOr(name), parent: context }).pipe(
          Option.flatMap((held) =>
            Option.map(resolve(lom, held.name, held.parent), (child) => ({
              child,
              parent: held.parent,
            })),
          ),
        );
        if (Option.isSome(capped)) {
          caps.push({ ...capped.value, line: index + 1 });
        } else {
          unread.push(`line ${String(index + 1)}: ${test}`);
        }
      }
    }

    return { caps, unread };
  });

/**
 * The pinned schema sets.
 */
const schemas: readonly SourcePath[] = [
  "imsqti_asiv3p0p1_v1p0.xsd",
  "imsqtiv3p0p1_imscpv1p2_v1p0.xsd",
  "imsqti_metadatav3p0_v1p0.xsd",
];

/**
 * A draw from the run's seed: a generator's first case on the stream the run seed and a label mint,
 * so each run draws its own and `TEST_SEED` replays it (doctrine rule 7).
 */
type Seeded = <A>(label: string, generator: Gen<A>) => A;

/**
 * The run's seeded draw.
 */
const seededDraw = runOfProcess.pipe(
  Effect.map(
    (run): Seeded =>
      (label, generator) =>
        sample(generator, rotatingSeed(run.seed, floorSeed(label)), 1).at(0) ??
        assert.fail(`no case drawn for ${label}`),
  ),
);

/**
 * Some of a list, `count` of them or all when it holds fewer, in a drawn order.
 *
 * @param values - The list.
 * @param count - How many to draw.
 * @returns The generator.
 */
const someOf = (values: readonly string[], count: number): Gen<readonly string[]> =>
  shuffled(values, { max: Math.min(count, values.length), min: Math.min(count, values.length) });

/**
 * The most kinds an alphabet holds of those a model's element particles name: every one where the
 * model names at most this many, else this many drawn from the run's seed.
 */
const namedBound = 4;

/**
 * Draw the child kinds a model's differential draws its sequences over: {@link namedBound} of the
 * kinds its element particles name, one kind only its wildcard admits, and one element kind its
 * parent does not admit at all, the named invalid variant, each drawn from the run's seed.
 *
 * @param named - The kinds the element particles name, in particle order.
 * @param byWildcard - The admitted kinds no element particle names.
 * @param unadmitted - The element kinds the parent does not admit.
 * @returns The alphabet's generator.
 */
const alphabetOf =
  (
    named: readonly string[],
    byWildcard: readonly string[],
    unadmitted: readonly string[],
  ): Gen<readonly string[]> =>
  (source) => [
    ...new Set([
      ...source.draw(someOf(named, namedBound)),
      ...source.draw(someOf(byWildcard, 1)),
      ...source.draw(someOf(unadmitted, 1)),
    ]),
  ];

/**
 * Read spec reading `mathml-validity`'s classes from a schema's own reading of the XSD: the content
 * expressions, the XSD's `ContExp` as `m:condition`'s model names it with the RelaxNG's
 * `semantics-contexp`, and the math expressions, as `m:mrow`'s model names them
 * (`#pantry/test/gen/relaxng.ts`).
 *
 * @param contents - The schema's contents, by kind.
 * @param resolve - The grammar's name resolution under a parent.
 * @param namespaceOf - A kind's namespace, none for a kind with no element name.
 * @returns The classes.
 */
const mathClassesOf = (
  contents: ReadonlyMap<string, readonly Content[]>,
  resolve: (namespace: string, local: string, parent: string) => Option.Option<string>,
  namespaceOf: (kind: string) => Option.Option<string>,
): MathClasses => {
  const namedBy = (parent: string): readonly string[] =>
    (contents.get(parent) ?? [])
      .flatMap(({ particle }) => Option.toArray(particle))
      .flatMap(elementsOf)
      .flatMap(({ members }) => members)
      .flatMap(({ name }) => Option.toArray(resolve(name.namespace, name.local, parent)));

  return {
    // The parent's wildcard decides which outside elements stand for `anyElement`: its admitted
    // kinds the XSD does not name, which each model's test reads (`byWildcard`).
    anyElement: () => false,
    content: new Set([...namedBy("m:condition"), semanticsContexp]),
    inMathml: (kind) =>
      kind === foreignKinds.own || Option.contains(namespaceOf(kind), mathmlNamespace),
    math: new Set(namedBy("m:mrow")),
  };
};

/**
 * Every sequence of at most `length` letters of an alphabet, shortest first.
 *
 * @param alphabet - The letters.
 * @param length - The longest sequence.
 * @returns The sequences.
 */
const sequencesOf = (alphabet: readonly string[], length: number): readonly (readonly string[])[] =>
  Array.from({ length: length + 1 }, (_, size) => size).flatMap((size) => {
    let words: (readonly string[])[] = [[]];
    for (let at = 0; at < size; at += 1) {
      words = words.flatMap((word) => alphabet.map((letter) => [...word, letter]));
    }

    return words;
  });

/**
 * The spec readings each parent's content edits state, in the facets production composes: an edit
 * whose source cites a spec reading by its slug states that reading at its parent.
 */
const statedReadings: ReadonlyMap<string, ReadonlySet<string>> = (() => {
  const stated = new Map<string, Set<string>>();
  for (const facets of [...Object.values(vocabularyFacets), documentLayer, openVocabulary]) {
    for (const edit of facets.content.edits) {
      const cited = /^spec reading `(?<reading>[a-z][a-z0-9-]*)`/u.exec(edit.source)?.groups?.[
        "reading"
      ];
      if (cited !== undefined) {
        const readings = stated.get(edit.parent) ?? new Set<string>();
        readings.add(cited);
        stated.set(edit.parent, readings);
      }
    }
  }

  return stated;
})();

/**
 * Every exemption the differentials below rule a disagreement by, each keyed to the reading it
 * cites and the parents it holds at: reading `mathml-validity` under the MathML models the RelaxNG
 * decides, reading `ssml-token-without-voice` where `ssml:token` and `ssml:w` drop `voice`, reading
 * `ordering-extension-slot` at `qti-ordering`'s extension slot, which it reads as `##any` where the
 * XSD writes `##other`, and reading `include-fallback` at an include's fallbacks. Reading
 * `repeated-wildcard-order` is libxml2's departure, not the grammar's.
 */
const exemptions: readonly { readonly parents: readonly string[]; readonly reading: string }[] = [
  { parents: [...relaxNgModels.keys()], reading: "mathml-validity" },
  { parents: ["ssml:token", "ssml:w"], reading: "ssml-token-without-voice" },
  { parents: ["qti-ordering"], reading: "ordering-extension-slot" },
  { parents: ["xi:include"], reading: "include-fallback" },
  { parents: ["table"], reading: "col-or-colgroup" },
  { parents: ["figure"], reading: "single-figcaption" },
];

/**
 * Whether a differential may set a family of `parent` aside for `reading`: the exemption is
 * listed, and the facets still state the reading at that parent. A reading withdrawn from the
 * facets so withdraws its exemption: the differential judges the family again, and the exemptions'
 * own test fails until the row goes.
 *
 * @param reading - The spec reading.
 * @param parent - The family's parent.
 * @returns Whether the reading exempts the family.
 */
const exempts = (reading: string, parent: string): boolean =>
  statedReadings.get(parent)?.has(reading) === true &&
  exemptions.some((row) => row.reading === reading && row.parents.includes(parent));

/**
 * Whether a spec reading narrows the XSD to refuse a family it accepts. Reading
 * `ssml-token-without-voice`: an SSML `token` or `w` holds no `voice` (SSML 1.1 §3.1.8.2), where
 * `tokenType` admits one. Reading `include-fallback`: an include holds at most one fallback
 * (XInclude 1.0 §3.1), where its XSD admits any number, so an include's family that holds two.
 *
 * @param parent - The family's parent.
 * @param children - The family.
 * @returns Whether a reading narrows it.
 */
const narrowedByReading = (parent: string, children: readonly string[]): boolean =>
  (exempts("ssml-token-without-voice", parent) && children.includes("ssml:voice")) ||
  (exempts("include-fallback", parent) &&
    children.filter((child) => child === "xi:fallback").length > 1) ||
  (exempts("col-or-colgroup", parent) &&
    children.includes("col") &&
    children.includes("colgroup")) ||
  (exempts("single-figcaption", parent) &&
    children.filter((child) => child === "figcaption").length > 1);

describe("the content automata against the XSD", () => {
  beforeAll(xsdCachePresent);

  it.effect(
    "accept exactly the child sequences the independent reading's automaton accepts, every model with one content: every sequence of at most 2 children (3 over an alphabet of at most 4) over at most 4 kinds it names, one only its wildcard admits and one it refuses, drawn from the run seed",
    (ctx) =>
      // Oracle: a second implementation, the tests' own automaton of each XSD particle
      // (`acceptorOf`), with spec readings `mathml-validity`, `ssml-token-without-voice`, `include-fallback`, `col-or-colgroup` and `single-figcaption` ruled where they narrow the
      // XSD.
      // Bound: namedBound of the kinds a model names (every one where it names at most that many),
      // one kind only its wildcard admits and one element kind it does not admit, each a fresh draw
      // each run (TEST_SEED replays it); every sequence of at most 2 children over that alphabet, 3
      // where it holds at most 4 kinds. A kind with more than one content is skipped, and the count
      // reported.
      Effect.gen(function* everyModel() {
        const composedGrammar = yield* grammar;
        const { content, kinds } = composedGrammar;
        const admission = admittedOf(content.contentModelOf, content.admissionIn);
        const draw = yield* seededDraw;
        const isElement = (kind: string) => Option.isSome(kinds.isElement.lookup({ kind }));
        const disagreements: string[] = [];
        let compared = 0;
        let models = 0;
        let ruled = 0;
        let skipped = 0;
        let drawnFrom = 0;
        for (const root of schemas) {
          const { contents } = yield* readingOf(root);
          const classes = mathClassesOf(contents, resolverOf(kinds), (kind) =>
            Option.map(kinds.elementName.lookup({ kind }), ({ namespace }) => namespace),
          );
          for (const [parent, readings] of contents) {
            const [reading, ...others] = readings;
            skipped += others.length > 0 ? 1 : 0;
            if (reading !== undefined && others.length === 0) {
              const resolve = (
                members: readonly {
                  readonly name: { readonly local: string; readonly namespace: string };
                }[],
              ) =>
                members.flatMap((member) =>
                  Option.toArray(
                    resolverOf(kinds)(member.name.namespace, member.name.local, parent),
                  ),
                );
              const named: readonly string[] = Option.match(reading.particle, {
                onNone: (): readonly string[] => [],
                onSome: (particle) => [
                  ...new Set(elementsOf(particle).flatMap((held) => resolve(held.members))),
                ],
              });
              const admitted = admission
                .filter((row) => row.parent === parent && isElement(row.child))
                .map(({ child }) => child);
              const byWildcard: readonly string[] = admitted.filter(
                (child) => !named.includes(child),
              );
              const unadmitted = kinds.nodeKind.handles.filter(
                (kind) => isElement(kind) && !admitted.includes(kind),
              );
              const oracle = Option.match(reading.particle, {
                onNone: () => (children: readonly string[]) => children.length === 0,
                onSome: (particle) => acceptorOf(particle, resolve, byWildcard),
              });
              const alphabet = draw(
                `grammar/content/alphabet ${root} ${parent}`,
                alphabetOf(named, byWildcard, unadmitted),
              );
              models += 1;
              drawnFrom += named.length > namedBound ? 1 : 0;
              for (const children of sequencesOf(alphabet, alphabet.length <= 4 ? 3 : 2)) {
                compared += 1;
                const installed = accepts(composedGrammar, parent, children);
                const xsd = oracle(children);
                const narrowed = xsd && !installed && narrowedByReading(parent, children);
                // Spec reading `mathml-validity`: under the models it restates or edits, the MathML 3 RelaxNG
                // decides, in both directions, and where the XSD differs it is the reading's.
                const rng = exempts("mathml-validity", parent)
                  ? relaxNgModels.get(parent)
                  : undefined;
                if (rng !== undefined) {
                  if (
                    installed !==
                    rng(children, { ...classes, anyElement: (kind) => byWildcard.includes(kind) })
                  ) {
                    disagreements.push(
                      `${root} ${parent} [${children.join(", ")}]: installed ${installed ? "accepts" : "refuses"} against the RelaxNG`,
                    );
                  } else if (installed !== xsd) {
                    ruled += 1;
                  }
                } else if (narrowed) {
                  ruled += 1;
                } else if (installed !== xsd) {
                  disagreements.push(
                    `${root} ${parent} [${children.join(", ")}]: installed ${installed ? "accepts" : "refuses"}`,
                  );
                }
              }
            }
          }
        }

        yield* Effect.promise(() =>
          ctx.annotate(
            `${models} models (${drawnFrom} naming more than ${namedBound} kinds, whose ${namedBound} the run seed drew), ${compared} sequences, ${ruled} ruled by readings \`mathml-validity\`, \`ssml-token-without-voice\`, \`include-fallback\`, \`col-or-colgroup\` and \`single-figcaption\`; ${skipped} kinds skipped for holding more than one content`,
            "bound",
          ),
        );
        assert.isAbove(compared, 0);
        assert.deepStrictEqual(disagreements.slice(0, 40), []);
      }).pipe(Effect.provide(XsdOracleLayer)),
  );
});

/**
 * Whether OperatorArity holds a group's relaxed bound: the operator's `OperatorArity` is exactly
 * the group's (min, max), and each repeat of the group is one element child, every member one
 * element particle exactly once and the group a choice or of one member, so the count of element
 * children is the group's repeat count.
 *
 * @param composedGrammar - The grammar.
 * @param parent - The operator's kind.
 * @param group - The group, as the tests' reader reads it.
 * @returns Whether the Arity law states the group's bound.
 */
const arityStates = (
  composedGrammar: ComposedGrammar,
  parent: string,
  group: Extract<Particle, { readonly particles: readonly Particle[] }>,
): boolean => {
  const { max, min } = group.occurs;
  const exact = Option.exists(
    arityOf(composedGrammar, parent),
    (row) =>
      row.min === BigInt(min) &&
      Option.getOrUndefined(row.max) === (Number.isFinite(max) ? BigInt(max) : undefined),
  );

  return (
    exact &&
    (group._tag === "choice" || group.particles.length === 1) &&
    group.particles.every(
      (member) => member._tag === "element" && member.occurs.min === 1 && member.occurs.max === 1,
    )
  );
};

describe("the occurrence bounds the automata relax", () => {
  beforeAll(xsdCachePresent);

  it.effect(
    "are laws beside them: an element particle's in Counted and CountedMax, a group's in OperatorArity and OperatorMax at exactly its bound, and Capped the LOM binding's Schematron caps and a figure's one caption, nothing else",
    () =>
      // Oracle: the tests' own reading of the XSDs, and of the LOM binding's embedded Schematron
      // from its text. A position automaton holds a particle's bound exactly when its least is 0
      // or 1 and its greatest 1 or unbounded (Brüggemann-Klein and Wood); every other bound is a
      // count, which Counted states for one particle's children and OperatorArity for a whole
      // content's, and which only holds as a total where no enclosing group may repeat or be
      // absent. A group's bound is OperatorArity's (min, max) exactly, and each of its repeats one
      // element child. Each Schematron assert caps its element at one in its context's family
      // (spec reading `lom-repetition`), Capped's at the element's position.
      Effect.gen(function* relaxed() {
        const composedGrammar = yield* grammar;
        const { admission, content, kinds, operatorArity } = composedGrammar;
        const arities = new Set<string>(operatorArity.rows.map(({ kind }) => kind));
        const expected = new Set<string>();
        const unstatable: string[] = [];
        const counted = (parent: string, kind: string, min: number, max: number) => {
          const position = Option.match(admission.lookup({ child: kind, parent }), {
            onNone: () => "none",
            onSome: (row) => row.position,
          });
          expected.add(`${parent} ${position} ${min} ${max}`);
        };
        for (const root of schemas) {
          const { contents } = yield* readingOf(root);
          for (const [parent, models] of contents) {
            const walk = (particle: Particle, enclosed: boolean): void => {
              const { max, min } = particle.occurs;
              const relaxes = min >= 2 || (max >= 2 && Number.isFinite(max));
              if (relaxes && particle._tag === "element" && !enclosed) {
                for (const { name } of particle.members) {
                  for (const kind of Option.toArray(
                    resolverOf(kinds)(name.namespace, name.local, parent),
                  )) {
                    counted(parent, kind, min, max);
                  }
                }
              } else if (relaxes && particle._tag !== "element" && particle._tag !== "any") {
                if (
                  enclosed ||
                  !arities.has(parent) ||
                  !arityStates(composedGrammar, parent, particle)
                ) {
                  unstatable.push(`${root} ${parent}: a ${particle._tag} of ${min}..${max}`);
                }
              } else if (relaxes) {
                unstatable.push(`${root} ${parent}: a ${particle._tag} of ${min}..${max} inside`);
              }

              if (particle._tag !== "element" && particle._tag !== "any") {
                for (const child of particle.particles) {
                  walk(child, enclosed || max > 1 || min === 0);
                }
              }
            };
            for (const particle of models.flatMap((model) => Option.toArray(model.particle))) {
              walk(particle, false);
            }
          }
        }

        const schematron = yield* schematronCaps(composedGrammar);
        for (const { child, parent } of schematron.caps) {
          counted(parent, child, 0, 1);
        }

        // Spec reading `single-figcaption`: a figure's caption has multiplicity [0..1] (information model §5.54.1),
        // which the XSD's unbounded choice repeats.
        counted("figure", "figcaption", 0, 1);

        assert.deepStrictEqual(schematron.unread, []);
        assert.strictEqual(schematron.caps.length, 94);
        assert.deepStrictEqual(unstatable, []);
        assert.deepStrictEqual(
          new Set(
            countBoundsOf(content).map(
              ({ max, min, parent, position }) => `${parent} ${position} ${min} ${max}`,
            ),
          ),
          expected,
        );
      }).pipe(Effect.provide(XsdOracleLayer)),
  );
});
