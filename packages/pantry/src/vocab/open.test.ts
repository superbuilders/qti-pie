import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option, Result } from "effect";
import { XML_NAMESPACE } from "@qti-pie/crust/tree.ts";
import { composed, coveredBy, namespaceLaxKinds } from "#pantry/grammar/compose.ts";
import { foreignKinds, isForeignKind } from "#pantry/grammar/kinds.ts";
import { constraintAdmits, foreignNamespace } from "#pantry/test/gen/vocab.ts";
import { attributeWildcards } from "#pantry/vocab/inventory/attributes.ts";
import { contentModels } from "#pantry/vocab/inventory/models.ts";
import type {
  AttributeWildcard,
  ContentType,
  NamespaceConstraint,
  Particle,
  VocabularyRoster,
} from "#pantry/vocab/inventory/types.ts";
import { vocabularies } from "#pantry/vocab/inventory/vocabularies.ts";
import {
  asiNamespace,
  mathmlNamespace,
  namespaceClassOf,
  namespaceNameOf,
} from "#pantry/vocab/namespaces.ts";
import { openClassOf } from "#pantry/vocab/open.ts";
import { searchWidth } from "#pantry/test/settings.ts";

/**
 * How long one search case may run: every case reads precomputed verdicts or classifies one name.
 */
const caseHang = Duration.minutes(1);

/**
 * The rosters, read as rosters rather than as the leaf's literal tuples.
 */
const rosters: readonly VocabularyRoster[] = vocabularies;

/**
 * The element particles and wildcards of a tree, in tree order, the places `targetsOf` and
 * `wordWith` number, each with whether it may occur: no bound of 0 on it or on a group around it.
 *
 * @param particle - The tree.
 * @param possible - Whether the tree itself may occur.
 * @returns Its leaves.
 */
const placesOf = (
  particle: Particle,
  possible = true,
): readonly {
  readonly leaf: Extract<Particle, { readonly _tag: "any" | "element" }>;
  readonly possible: boolean;
}[] => {
  const here = possible && !Option.contains(particle.occurs.max, 0);

  return particle._tag === "group"
    ? particle.particles.flatMap((inner) => placesOf(inner, here))
    : [{ leaf: particle, possible: here }];
};

/**
 * The names of the namespaces a namespace-class cell tries.
 */
type NamespaceLabel = "absent" | "other" | "target" | "xml";

/**
 * The namespaces each namespace-class cell tries against a wildcard's target namespace, each
 * named: the target itself, none, one no schema declares, and the XML namespace, which no pinned
 * schema document but `xml.xsd` has as its target, and `xml.xsd` holds no wildcard.
 *
 * @param target - The wildcard's target namespace, its kind's namespace.
 * @returns Each namespace with its name.
 */
const namespacesAgainst = (target: string): readonly (readonly [NamespaceLabel, string])[] => [
  ["target", target],
  ["absent", ""],
  ["other", foreignNamespace],
  ["xml", XML_NAMESPACE],
];

/**
 * The situations the namespace-class suite must reach: every namespace constraint the pinned XSDs
 * write, against each namespace a cell tries.
 */
const classSituations = [
  "##any target",
  "##any absent",
  "##any other",
  "##any xml",
  "##other target",
  "##other absent",
  "##other other",
  "##other xml",
  "##local target",
  "##local absent",
  "##local other",
  "##local xml",
] as const satisfies readonly `${NamespaceConstraint} ${NamespaceLabel}`[];

/**
 * The namespace of every kind, by its roster.
 */
const namespaceOfKind: ReadonlyMap<string, string> = new Map(
  rosters.flatMap(({ kinds, namespace }) =>
    kinds.map(({ handle }) => [handle, namespace] as const),
  ),
);

/**
 * The element wildcards of a model that may occur, each with its namespace constraint and
 * processing.
 *
 * @param content - The model.
 * @returns The wildcards, in tree order.
 */
const wildcardsIn = (
  content: ContentType,
): readonly Extract<Particle, { readonly _tag: "any" }>[] =>
  content._tag === "element-only" || content._tag === "mixed"
    ? placesOf(content.particle).flatMap(({ leaf, possible }) =>
        possible && leaf._tag === "any" ? [leaf] : [],
      )
    : [];

/**
 * The model `xs:anyType` gives a foreign element: its attribute and element wildcards, `##any` and
 * `lax` (XML Schema 1.0 Part 1, §3.4.7).
 */
const anyTypeWildcard = { namespace: "##any", processing: "lax" } as const;

/**
 * One cell of the namespace-class suite: a kind, the wildcards its content and its
 * attributes hold, and its namespace, each wildcard's target namespace.
 */
interface ClassCell {
  readonly attributes: readonly (typeof anyTypeWildcard | AttributeWildcard)[];
  readonly elements: readonly (
    | typeof anyTypeWildcard
    | Extract<Particle, { readonly _tag: "any" }>
  )[];
  readonly kind: string;
  readonly own: string;
}

/**
 * Read a kind's element wildcards as the spec readings restate them: spec reading 61 reads
 * `qti-ordering`'s extension slot as `##any`, laxly, where the XSD writes `##other`, since the
 * information model says its child tags "may be new tags and reused QTI ASI tags" (§5.98.3).
 *
 * @param kind - The wildcards' kind.
 * @param wildcards - Its element wildcards as the XSD writes them.
 * @returns The wildcards the grammar states.
 */
const restatedWildcards = (
  kind: string,
  wildcards: readonly Extract<Particle, { readonly _tag: "any" }>[],
): readonly Extract<Particle, { readonly _tag: "any" }>[] =>
  kind === "qti-ordering"
    ? wildcards.map((wildcard) => ({ ...wildcard, namespace: "##any", processing: "lax" }))
    : wildcards;

/**
 * Every cell: each kind a model states, with its element and attribute wildcards, its element
 * wildcards as the spec readings restate them, and each foreign kind, whose wildcards are
 * `xs:anyType`'s and whose namespace, a foreign element's own, is one no schema declares.
 */
const classCells: readonly ClassCell[] = [
  ...contentModels.map(({ content, kind }) => ({
    attributes: attributeWildcards.filter((row) => row.kind === kind),
    elements: restatedWildcards(kind, wildcardsIn(content)),
    kind,
    own: namespaceOfKind.get(kind) ?? "",
  })),
  ...Object.values(foreignKinds).map((kind) => ({
    attributes: [anyTypeWildcard],
    elements: [anyTypeWildcard],
    kind,
    own: "urn:foreign-host",
  })),
];

describe("vocab/open.ts namespace classes against XML Schema 1.0, 3.10.4", () => {
  it.effect(
    "admits a foreign element or an open attribute of a namespace exactly where a wildcard does",
    (ctx) =>
      Effect.gen(function* classes() {
        const grammar = yield* Effect.fromResult(composed());
        const covered = coveredBy(grammar.kinds);
        // Q8's case 131: an ASI-namespace element, `{…imsqtiasi_v3p0}widget`, under a `##other`
        // wildcard of an ASI kind, which xmllint refuses as outside the wildcard.
        const case131 = classCells.filter(
          ({ elements, own }) =>
            own === asiNamespace && elements.some(({ namespace }) => namespace === "##other"),
        );

        assert.isAbove(case131.length, 0);
        assert.deepStrictEqual(
          case131.filter(({ kind }) =>
            Option.isSome(
              grammar.admission.lookup({
                child:
                  foreignKinds[
                    namespaceClassOf(namespaceNameOf(asiNamespace), namespaceNameOf(asiNamespace))
                  ],
                parent: kind,
              }),
            ),
          ),
          [],
        );

        return yield* searched(
          ctx,
          exhaust(
            {
              box: `every kind a model states, and each foreign kind, against the target, absent, another and the XML namespace: ${classCells.length} cells`,
              caseHang,
              concurrency: searchWidth,
              coverage: requiredInSpace<(typeof classSituations)[number]>(classSituations),
              generator: int(0, classCells.length - 1),
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "XML Schema 1.0 Part 1 §3.10.4's namespace constraints (constraintAdmits) over the leaf's wildcards, with spec readings 2, 61, 81 and 90",
              },
              suite: "vocab/open-namespace-classes",
            },
            (index, c) =>
              Effect.sync(() => {
                const { attributes, elements, kind, own } = Arr.getUnsafe(classCells, index);
                const wrong = namespacesAgainst(own).flatMap(([label, namespace]) => {
                  const foreign =
                    foreignKinds[
                      namespaceClassOf(namespaceNameOf(namespace), namespaceNameOf(own))
                    ];
                  // Every processing admits an undeclared element its constraint admits; a
                  // `strict` one only with an xsi:type its document's schema set resolves (spec
                  // reading 81), so `StrictlyHeld` marks a foreign kind only strict wildcards admit.
                  // No wildcard admits one in MathML's namespace: MathML content stands only inside
                  // m:math, and the RelaxNG's anyElement excludes MathML's own (spec reading 2).
                  const admitting = elements.filter(
                    ({ namespace: constraint }) =>
                      namespace !== mathmlNamespace && constraintAdmits(constraint, own, namespace),
                  );
                  const elementSpecified = admitting.length > 0;
                  const strictSpecified =
                    elementSpecified &&
                    admitting.every(({ processing }) => processing === "strict");
                  const elementRead = Option.isSome(
                    grammar.admission.lookup({ child: foreign, parent: kind }),
                  );
                  const strictRead = Option.isSome(
                    grammar.content.strictlyHeld.lookup({ child: foreign, parent: kind }),
                  );
                  const attribute = Result.getOrThrow(
                    openClassOf(
                      {
                        local: "zz",
                        namespace,
                        prefix: namespace === "" ? "" : "p",
                        qname: namespace === "" ? "zz" : "p:zz",
                      },
                      { foreign: isForeignKind(kind), local: kind, namespace: own },
                    ),
                  )._tag;
                  // On an element the Schematron's extension rules cover, spec reading 90 admits no
                  // attribute its XSD does not declare but a `data-` one, whatever its wildcard
                  // admits, and the drawn name is no `data-` name; but a kind whose class states a
                  // `NamespaceLax` extension (information model §5.36.1, SV-LAW-05) admits what its
                  // `##other` wildcard does.
                  const attributeSpecified = covered(kind)
                    ? namespaceLaxKinds.has(kind) && constraintAdmits("##other", own, namespace)
                    : attributes.some(
                        ({ namespace: constraint, processing }) =>
                          processing !== "strict" && constraintAdmits(constraint, own, namespace),
                      );
                  const attributeRead = Option.isSome(
                    grammar.attributes.admission.lookup({ kind, name: attribute }),
                  );

                  for (const { namespace: constraint } of [...elements, ...attributes]) {
                    c.note(`${constraint} ${label}`);
                  }

                  return [
                    ...(elementRead === elementSpecified
                      ? []
                      : [
                          `${kind}: a foreign element in the ${label} namespace (${foreign}) is ${elementRead ? "admitted" : "refused"}, and its element wildcards ${elementSpecified ? "admit" : "refuse"} it`,
                        ]),
                    ...(strictRead === strictSpecified
                      ? []
                      : [
                          `${kind}: a foreign element in the ${label} namespace (${foreign}) is ${strictRead ? "" : "not "}strictly held, and its element wildcards are ${strictSpecified ? "" : "not "}all strict`,
                        ]),
                    ...(attributeRead === attributeSpecified
                      ? []
                      : [
                          `${kind}: an undeclared attribute in the ${label} namespace (${attribute}) is ${attributeRead ? "admitted" : "refused"}, and its attribute wildcard ${attributeSpecified ? "admits" : "refuses"} it`,
                        ]),
                  ];
                });

                assert.strictEqual(wrong.join("\n"), "");
              }),
          ),
        );
      }),
  );
});
