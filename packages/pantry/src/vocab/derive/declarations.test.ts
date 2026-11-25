import path from "node:path";
import * as NodeChildProcessSpawner from "@effect/platform-node/NodeChildProcessSpawner";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, beforeAll, describe, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import {
  Array as Arr,
  Context,
  Duration,
  Effect,
  FileSystem,
  Formatter,
  Layer,
  Option,
} from "effect";
import { Digest } from "effect/crypto";
import { XML_NAMESPACE } from "@qti-pie/crust/tree.ts";
import { constraintAdmits, probeText, probeValueOf } from "#pantry/test/gen/vocab.ts";
import { searchWidth, settings } from "#pantry/test/settings.ts";
import { oxfmt } from "#pantry/test/oxfmt.ts";
import {
  attributeDeclarationsOf,
  attributeWildcardsOf,
  globalKindsOf,
  governingRowsOf,
  loadDeclarations,
  loadGlobalAttributes,
  renderAttributes,
  renderVocabularies,
  rostersOf,
  textTypesOf,
} from "#pantry/vocab/derive/declarations.ts";
import {
  classOf,
  probeTargetsOf,
  probeWorldOf,
  rootNameOf,
  validate,
} from "#pantry/test/gen/xmllint.ts";
import type { ValidityError } from "#pantry/test/gen/xmllint.ts";
import { attributeDeclarations, attributeWildcards } from "#pantry/vocab/inventory/attributes.ts";
import { contentModels } from "#pantry/vocab/inventory/models.ts";
import { vocabularies } from "#pantry/vocab/inventory/vocabularies.ts";
import { fileScratchDirectory } from "#pantry/test/scratch.ts";
import { xsdCachePresent } from "#pantry/test/xsd-catalog.ts";

/**
 * The folder the xmllint probes are written to, `work/vocab-attributes-oracle-*`, the run's own, so
 * two runs at once never rewrite each other's driver under xmllint.
 */
const oracleRoot = fileScratchDirectory("vocab-attributes-oracle-");

/**
 * The package folder, `packages/pantry`, which the committed leaves and oxfmt are relative to.
 */
const packageRoot = path.resolve(import.meta.dirname, "../../..");

/**
 * How long one search case may run: each reads precomputed verdicts.
 */
const caseHang = Duration.minutes(1);

/**
 * The handle of an `xml:` attribute's local name.
 *
 * @param local - The local name.
 * @returns `xml:<local>`.
 */
const xmlHandle = (local: string): string => `xml:${local}`;

/**
 * Every no-namespace attribute name a kind of any vocabulary declares, and one no XSD declares:
 * the names an omission check tries on each kind that does not declare them.
 */
const universe: readonly string[] = [
  ...Arr.dedupe(attributeDeclarations.flatMap(({ name }) => (name.includes(":") ? [] : [name]))),
  "zz-undeclared",
];

/**
 * The four `xml:` names `xml.xsd` declares.
 */
const xmlNames: readonly string[] = ["lang", "space", "base", "id"].map(xmlHandle);

/**
 * What one attribute probe asks.
 *
 * - `required`: the kind with no attribute; the leaf says which names it requires.
 * - `declared`: the kind with every name it declares; the leaf says none is refused.
 * - `undeclared`: the kind with one name it does not declare; the leaf's wildcard says whether it is
 *   admitted.
 */
type Question =
  | { readonly _tag: "declared"; readonly names: readonly string[] }
  | { readonly _tag: "required"; readonly names: readonly string[] }
  | {
      readonly _tag: "undeclared";
      readonly admitted: boolean;
      readonly name: string;
      readonly underOtherLax: boolean;
    };

/**
 * One judged question: the kind, the question, and what the validator's errors for
 * its probe say, read once for the probe that every question of it shares: the names they require
 * and the names they refuse.
 */
interface Judged {
  readonly kind: string;
  readonly question: Question;
  readonly refused: ReadonlySet<string>;
  readonly required: readonly string[];
}

/**
 * The attribute a validity error names, as a handle: the local name in no namespace, `xml:` in the
 * XML namespace, and the Clark name otherwise.
 *
 * @param reported - The error.
 * @returns The handle, or `None` for an error on no attribute.
 */
const attributeHandleOf = (reported: ValidityError): Option.Option<string> =>
  reported.attribute.pipe(
    Option.map((written) =>
      written.startsWith(`{${XML_NAMESPACE}}`)
        ? xmlHandle(written.slice(XML_NAMESPACE.length + 2))
        : written,
    ),
  );

/**
 * The names a probe's `attribute-required` errors name.
 *
 * @param errors - The probe's errors.
 * @returns The names, sorted.
 */
const requiredNamesOf = (errors: readonly ValidityError[]): readonly string[] =>
  errors
    .flatMap((reported) =>
      classOf(reported) === "attribute-required"
        ? Option.toArray(
            Option.fromNullishOr(
              /The attribute '(?<name>.+)' is required/u.exec(reported.message)?.groups?.["name"],
            ),
          )
        : [],
    )
    .map((written) =>
      written.startsWith(`{${XML_NAMESPACE}}`)
        ? xmlHandle(written.slice(XML_NAMESPACE.length + 2))
        : written,
    )
    .toSorted((left, right) => (left < right ? -1 : 1));

/**
 * The names a probe's validator refused as attributes: not allowed, or refused by a strict
 * wildcard.
 *
 * @param errors - The probe's errors.
 * @returns The handles of the refused names.
 */
const refusedNamesOf = (errors: readonly ValidityError[]): ReadonlySet<string> =>
  new Set(
    errors.flatMap((reported) =>
      classOf(reported) === "attribute-not-allowed" || classOf(reported) === "attribute-strict"
        ? Option.toArray(attributeHandleOf(reported))
        : [],
    ),
  );

/**
 * Pose every attribute question.
 *
 * @returns The judged questions.
 */
const judgeAttributes = Effect.fn("test.judgeAttributes")(function* judgeAttributes() {
  const { driver, targets } = yield* probeTargetsOf();
  const world = probeWorldOf({
    attributes: attributeDeclarations,
    models: contentModels,
    vocabularies,
  });
  const declared = Map.groupBy(attributeDeclarations, (row) => row.kind);
  const wildcards = new Map(attributeWildcards.map((row) => [row.kind, row] as const));
  const posed: {
    readonly kind: string;
    readonly probe: string;
    readonly questions: readonly Question[];
  }[] = [];

  for (const [kind, target] of targets) {
    const own = Option.match(world.elementOf(kind), {
      onNone: () => "",
      onSome: ({ namespace }) => namespace,
    });
    const root = rootNameOf(world, target);
    const names = (declared.get(kind) ?? []).map(({ name }) => name);
    const required = (declared.get(kind) ?? []).flatMap(({ name, use }) =>
      use === "required" ? [name] : [],
    );
    const wildcard = Option.fromNullishOr(wildcards.get(kind));
    const admittedLocal = Option.exists(
      wildcard,
      ({ namespace, processing }) =>
        processing !== "strict" && constraintAdmits(namespace, own, ""),
    );
    const undeclared = [
      ...universe.filter((name) => !names.includes(name)),
      ...xmlNames.filter((name) => !names.includes(name)),
    ];

    posed.push(
      {
        kind,
        probe: probeText(world, root, [], [], ""),
        questions: [
          { _tag: "required", names: required.toSorted((left, right) => (left < right ? -1 : 1)) },
        ],
      },
      {
        kind,
        probe: probeText(
          world,
          root,
          names.map((name) => [name, probeValueOf(name)] as const),
          [],
          "",
        ),
        questions: [{ _tag: "declared", names }],
      },
      {
        kind,
        probe: probeText(
          world,
          root,
          [
            ...world.requiredOf(kind).map(({ name }) => [name, probeValueOf(name)] as const),
            ...undeclared.map((name) => [name, probeValueOf(name)] as const),
          ],
          [],
          "",
        ),
        questions: undeclared.map((name): Question => ({
          _tag: "undeclared",
          admitted: name.startsWith("xml:") ? Option.isSome(wildcard) : admittedLocal,
          name,
          underOtherLax:
            !name.includes(":") &&
            Option.exists(
              wildcard,
              ({ namespace, processing }) => namespace === "##other" && processing === "lax",
            ),
        })),
      },
    );
  }

  const errors = yield* validate(
    "vocab-derive-declarations",
    oracleRoot,
    driver,
    posed.map(({ probe }) => probe),
  );

  return posed.flatMap(({ kind, questions }, at) => {
    const probed = errors[at] ?? [];
    const refused = refusedNamesOf(probed);
    const required = requiredNamesOf(probed);

    return questions.map((question): Judged => ({ kind, question, refused, required }));
  });
});

/**
 * The judged questions, read once for the suite.
 */
class Judgements extends Context.Service<Judgements, readonly Judged[]>()(
  "vocab/derive/declarations.test/Judgements",
) {}

/**
 * Pose and judge the questions.
 */
const JudgementsLayer = Layer.effect(
  Judgements,
  Effect.map(judgeAttributes(), (judged) => Judgements.of(judged)),
);

/**
 * The layers the suite runs on.
 */
const SuiteLayer = Layer.mergeAll(
  JudgementsLayer,
  NodeServices.layer,
  NodeChildProcessSpawner.layer,
  Digest.layerWebCrypto,
).pipe(
  Layer.provide(
    Layer.mergeAll(NodeServices.layer, Digest.layerWebCrypto, NodeChildProcessSpawner.layer),
  ),
  Layer.provide(NodeServices.layer),
);

/**
 * Whether xmllint's verdict on an undeclared name is one where libxml2 departs from XML Schema, so
 * the specification's verdict, the leaf's, stands (Bjorn's rule: the spec wins).
 *
 * Libxml2 2.9 admits an attribute in no namespace under an `##other` wildcard whose processing is
 * `lax`, though XML Schema 1.0 Part 1, 3.10.4 (Wildcard allows Namespace Name), clause 2.3, keeps
 * `##other` from admitting an absent namespace; it refuses the same attribute under a `strict` or
 * `skip` `##other`, as the specification does.
 *
 * @param question - The question.
 * @param admitted - Xmllint's verdict.
 * @returns Whether the verdict is that departure.
 */
const isOracleDeparture = (
  question: Extract<Question, { readonly _tag: "undeclared" }>,
  admitted: boolean,
): boolean => admitted && !question.admitted && question.underOtherLax;

/**
 * Judge one question against what its probe's errors say.
 *
 * @param judged - The question.
 * @returns A description of the disagreement, or `None` when the leaf and the XSDs agree.
 */
const disagreementOf = (judged: Judged): Option.Option<string> => {
  const { question, refused, required } = judged;

  switch (question._tag) {
    case "required": {
      return required.join(" ") === question.names.join(" ")
        ? Option.none()
        : Option.some(
            `the leaf requires [${question.names.join(" ")}], xmllint [${required.join(" ")}]`,
          );
    }
    case "declared": {
      const wrong = question.names.filter((name) => refused.has(name));

      return wrong.length === 0
        ? Option.none()
        : Option.some(`xmllint refuses the declared ${wrong.join(" ")}`);
    }
    case "undeclared": {
      const admitted = !refused.has(question.name);

      return admitted === question.admitted || isOracleDeparture(question, admitted)
        ? Option.none()
        : Option.some(
            `the leaf ${question.admitted ? "admits" : "refuses"} the undeclared ${question.name}, xmllint ${admitted ? "admits" : "refuses"} it`,
          );
    }
  }
};

// Committed-leaf guards, as the served and verdict files are, with xmllint's reading of the leaves
// beside them: they run at merge time, under QTI_PIE_CORPUS=1, beside the corpus witness, and out
// of the default run.
describe.skipIf(!settings.corpusRequested)(
  "vocab/derive/declarations.ts over the pinned XSDs",
  () => {
    beforeAll(xsdCachePresent);

    layer(SuiteLayer)("from the cache", (cached) => {
      cached.effect("regenerates both leaves byte for byte after oxfmt", () =>
        Effect.gen(function* regenerate() {
          const fs = yield* FileSystem.FileSystem;
          const readings = yield* loadDeclarations();
          const leaves = [
            [
              "src/vocab/inventory/vocabularies.ts",
              renderVocabularies(rostersOf(readings), globalKindsOf(readings)),
            ],
            [
              "src/vocab/inventory/attributes.ts",
              renderAttributes(
                attributeDeclarationsOf(readings),
                attributeWildcardsOf(readings),
                textTypesOf(readings),
                yield* loadGlobalAttributes(),
                governingRowsOf(readings),
              ),
            ],
          ] as const;

          for (const [file, text] of leaves) {
            assert.strictEqual(
              yield* oxfmt(text, file),
              yield* fs.readFileString(`${packageRoot}/${file}`),
              file,
            );
          }
        }),
      );

      cached.effect(
        "agrees with xmllint on every kind's required, declared and undeclared attributes",
        (ctx) =>
          Effect.gen(function* oracle() {
            const judged = yield* Judgements;

            const byKind = [...Map.groupBy(judged, ({ kind }) => kind).values()];

            return yield* searched(
              ctx,
              exhaust(
                {
                  box: `every kind of the leaf, each probed with its required, declared and undeclared attributes: ${byKind.length} probes`,
                  caseHang,
                  concurrency: searchWidth,
                  coverage: requiredInSpace<
                    | "admitted"
                    | "declared"
                    | "oracle-departure"
                    | "refused"
                    | "required"
                    | "undeclared"
                  >([
                    "required",
                    "declared",
                    "undeclared",
                    "admitted",
                    "refused",
                    "oracle-departure",
                  ]),
                  generator: int(0, byKind.length - 1),
                  literal: Formatter.format,
                  oracle: {
                    kind: "second-implementation",
                    name: "libxml2's schema validator over the pinned XSDs, but its departure under a lax ##other (isOracleDeparture)",
                  },
                  suite: "vocab/derive-declarations-xmllint",
                },
                (index, c) =>
                  Effect.sync(() => {
                    const disagreements = Arr.getUnsafe(byKind, index).flatMap((probe) => {
                      c.note(probe.question._tag);
                      if (probe.question._tag === "undeclared") {
                        c.note(probe.question.admitted ? "admitted" : "refused");
                        if (probe.question.underOtherLax) {
                          c.note("oracle-departure");
                        }
                      }

                      return Option.toArray(disagreementOf(probe)).map(
                        (found) => `${probe.kind}: ${found}`,
                      );
                    });

                    assert.strictEqual(
                      disagreements.slice(0, 12).join("\n"),
                      "",
                      `${disagreements.length} disagreements`,
                    );
                  }),
              ),
            );
          }),
      );
    });
  },
);
