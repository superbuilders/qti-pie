/**
 * The subjects of plate's block-count growth checks, by name: a computation, and the input of a
 * given size it runs on. `blockGrowth` (`#plate/test/growth.ts`) names a subject and a size, and
 * the counting process (`#plate/test/blocks.ts`) builds the subject's inputs and counts its runs,
 * importing this module only once its count has begun, so V8 compiles every function a subject
 * runs with block counters. A subject is either the real computation a growth check measures, or
 * a control's deliberately quadratic one, which shows that the check fails quadratic work. The
 * process builds each input itself, from its size, so no input crosses between processes.
 *
 * @module
 */
import { Effect, Schema } from "effect";
import type { SourceDocument, SourceElement } from "#plate/document/source.ts";
import type { UnsupportedFeature } from "#plate/model/item.ts";
import { readPnp } from "#plate/pnp/read.ts";
import { attr, declaration, el, item, paragraph } from "#plate/test/source.ts";
import { tables } from "#plate/validate/tables.ts";
import { checkAdmitted, unsupportedFeatures } from "#plate/validate/verdict.ts";

/**
 * An item with `count` template declarations of cardinality `record` and an empty body. The model
 * does not hold a `record` template declaration, so each is one unsupported feature at its own
 * path.
 *
 * @param count How many declarations the item holds.
 * @returns The document at `items/test.xml`.
 */
export const templated = (count: number): SourceDocument =>
  item({
    body: [paragraph],
    declarations: Array.from({ length: count }, (_, index) =>
      el("qti-template-declaration", [
        attr("cardinality", "record"),
        attr("identifier", `T${index}`),
      ]),
    ),
  });

/**
 * An item with `count` string response declarations and, in one paragraph, `count` Text Entry
 * interactions, each bound to its own declaration.
 *
 * @param count How many declarations and interactions the item holds.
 * @returns The document at `items/test.xml`.
 */
export const textEntries = (count: number): SourceDocument =>
  item({
    body: [
      el(
        "p",
        [],
        Array.from({ length: count }, (_, index) =>
          el("qti-text-entry-interaction", [attr("response-identifier", `R${index}`)]),
        ),
      ),
    ],
    declarations: Array.from({ length: count }, (_, index) =>
      declaration("qti-response-declaration", `R${index}`, "string", "single"),
    ),
  });

/**
 * The dedupe control's computation, deliberately quadratic: each feature is compared with every
 * feature kept so far, where `record` (`#plate/model/build.ts`) finds a repeat among the paths it
 * keys by feature.
 *
 * @param entries The features, in document order.
 * @returns The features once per feature and path, in document order.
 */
export const dedupeQuadratically = (
  entries: readonly UnsupportedFeature[],
): readonly UnsupportedFeature[] => {
  const kept: UnsupportedFeature[] = [];
  for (const entry of entries) {
    if (!kept.some((held) => held.feature === entry.feature && held.path === entry.path)) {
      kept.push(entry);
    }
  }

  return kept;
};

/**
 * Keep an element's element children, as the quadratic binding reads them.
 *
 * @param element The element.
 * @returns Its element children, in document order.
 */
const elementsIn = (element: SourceElement): readonly SourceElement[] =>
  element.children.filter((child): child is SourceElement => child.kind === "element");

/**
 * Read an attribute's value as written, as the quadratic binding reads it.
 *
 * @param element The element.
 * @param name The attribute's local name.
 * @returns The value, or `undefined` when the element does not carry it.
 */
const valueIn = (element: SourceElement, name: string): string | undefined =>
  element.attributes.find((attribute) => attribute.local === name)?.value;

/**
 * The binding control's computation, deliberately quadratic: each interaction reads every child of
 * the root for its declaration, where `buildItem` binds it through the map of declarations its
 * build reads once (`declarationsOf`, `#plate/model/build.ts`).
 *
 * @param source An item from {@link textEntries}.
 * @returns Each interaction's declaration, the last one with its identifier, in document order.
 */
export const bindQuadratically = (source: SourceDocument): readonly (SourceElement | undefined)[] =>
  elementsIn(source.root)
    .filter((part) => part.local === "qti-item-body")
    .flatMap(elementsIn)
    .flatMap(elementsIn)
    .map((interaction) =>
      elementsIn(source.root).findLast(
        (part) =>
          part.local === "qti-response-declaration" &&
          valueIn(part, "identifier") === valueIn(interaction, "response-identifier"),
      ),
    );

/**
 * Give one build of a document's item model, as a host builds an admitted item: through
 * `checkAdmitted`, which secures the document and builds it with `buildItem`.
 *
 * @param source A document the database admitted: the growth check opens the same document
 *   through `admittedItem` first.
 * @returns The build, run once each time it is called.
 */
const building =
  (source: SourceDocument): (() => void) =>
  () => {
    checkAdmitted(source, tables);
  };

/**
 * The hazards a repeated profile's `hazard-avoidance` children name in turn: three of PNP's own and
 * an extension, so the profile repeats each many times.
 */
const repeatedHazards = ["flashing", "sound", "ext:iowa-reading", "olfactory-hazard"] as const;

/**
 * An Access for All PNP profile of `count` `hazard-avoidance` children, the four
 * {@link repeatedHazards} in turn, in QTI 3.0's PNP namespace, as UTF-8 bytes.
 *
 * @param count How many children the profile holds.
 * @returns The profile's bytes.
 */
export const repeatedProfile = (count: number): Uint8Array =>
  new TextEncoder().encode(
    `<access-for-all-pnp xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imsafa3p0pnp_v1p0">${Array.from(
      { length: count },
      (_, at) =>
        `<hazard-avoidance>${repeatedHazards[at % repeatedHazards.length]}</hazard-avoidance>`,
    ).join("")}</access-for-all-pnp>`,
  );

/**
 * The subjects' names, the literals {@link CountingSchema} reads.
 */
const subjectNames = [
  "binds",
  "pnpRepeats",
  "quadraticBinding",
  "quadraticDedupe",
  "records",
] as const;

/**
 * The name of a subject.
 */
export type SubjectName = (typeof subjectNames)[number];

/**
 * The subjects by name: each builds its input of the given size, then gives back the one run the
 * counting process counts.
 */
export const subjects = {
  binds: (count: number) => building(textEntries(count)),
  pnpRepeats: (count: number) => {
    const profile = repeatedProfile(count);

    return () => {
      Effect.runSync(Effect.orDie(readPnp(profile)));
    };
  },
  quadraticBinding: (count: number) => {
    const source = textEntries(count);

    return () => {
      bindQuadratically(source);
    };
  },
  quadraticDedupe: (count: number) => {
    const features = unsupportedFeatures(checkAdmitted(templated(count), tables));

    return () => {
      dedupeQuadratically(features);
    };
  },
  records: (count: number) => building(templated(count)),
} satisfies { readonly [Name in SubjectName]: (count: number) => () => void };

/**
 * The counting process's arguments, as `blockGrowth` writes them: a subject's name, then the
 * sizes of its smaller input and of its larger.
 */
export const CountingSchema = Schema.Tuple([
  Schema.Literals(subjectNames),
  Schema.FiniteFromString,
  Schema.FiniteFromString,
]);
