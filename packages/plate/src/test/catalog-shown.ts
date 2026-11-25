/**
 * The rule a redacted item's catalogs are held to, written apart from the redaction: a catalog
 * reaches the page exactly when a part of the item the page is given names it by
 * `data-catalog-idref` (information model §5.28: a catalog "is referenced from a specific portion
 * of the content body"), so a catalog named only by content the page is not given, a feedback the
 * values hide, a template's content or a choice they hide, or a rubric block of another view, never
 * reaches it, card text included. The walk holds a redaction to it: plate's own in the property
 * (`#plate/content/catalog-shown.test.ts`), and each kill's mutant copy in a program of its own;
 * plate's UI suite renders the same item to hold the page's markup and its islands' props to it
 * (specimen's `src/ui/catalog-shown.test.ts`).
 *
 * @module
 */
import { Effect, Option } from "effect";
import { configure } from "#plate/configuration.ts";
import { defaultView } from "#plate/content/contract.ts";
import type { copyItemContent } from "#plate/content/modules.ts";
import type { Showing } from "#plate/model/record.ts";
import type { Value } from "#plate/model/values.ts";
import type { redact } from "#plate/redact.ts";
import { noSupports } from "#plate/supports.ts";
import type { CatalogSupport, Supports } from "#plate/supports.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The item's location in its package.
 */
export const shownCatalogsLocation = "items/catalog-shown.xml";

/**
 * The supports each catalog holds a card of: the three whose cards the page draws (a glossary card
 * beside its term, every other in the listing after the body) and `spoken`, whose card rides with
 * the page for read-aloud.
 */
export const supportsHeld = [
  "glossary-on-screen",
  "keyword-translation",
  "linguistic-guidance",
  "spoken",
] as const satisfies readonly CatalogSupport[];

/**
 * The text of a catalog's card of a support, unique to the two.
 *
 * @param catalog The catalog's `id`.
 * @param support The card's `support`.
 * @returns The card's text.
 */
export const cardText = (catalog: string, support: CatalogSupport): string =>
  `CARD-${catalog}-${support}`;

/**
 * Each catalog of the item, by `id`, with the showing that gives the page the part naming it:
 * `always` for a paragraph, a choice with no template visibility, the interaction's root and its
 * prompt; `shown` for a feedback block, a feedback inline, a template block and a choice a template
 * variable shows, which the page is given only when the record shows them; `never` for a rubric
 * block whose view is the scorer's alone, which the candidate's page is never given.
 */
const catalogs: ReadonlyMap<string, "always" | "never" | "shown"> = new Map([
  ["block", "shown"],
  ["choice", "always"],
  ["hidden", "shown"],
  ["inline", "shown"],
  ["interaction", "always"],
  ["paragraph", "always"],
  ["prompt", "always"],
  ["rubric", "never"],
  ["template", "shown"],
]);

/**
 * Every catalog's `id`, in document order.
 */
export const catalogIds: readonly string[] = [...catalogs.keys()];

/**
 * Write one catalog: a direct card of each support but the two whose entries are chosen,
 * `keyword-translation` by language and `spoken` by reading type, each an entry marked default,
 * which no parameter of the supports matches, so the default is what each gives.
 *
 * @param id The catalog's `id`.
 * @returns Its `qti-catalog`.
 */
const catalogXml = (id: string): string =>
  [
    `<qti-catalog id="${id}">`,
    `<qti-card support="glossary-on-screen"><qti-html-content><p>${cardText(id, "glossary-on-screen")}</p></qti-html-content></qti-card>`,
    `<qti-card support="keyword-translation"><qti-card-entry xml:lang="es" default="true"><qti-html-content><p>${cardText(id, "keyword-translation")}</p></qti-html-content></qti-card-entry></qti-card>`,
    `<qti-card support="linguistic-guidance"><qti-html-content><p>${cardText(id, "linguistic-guidance")}</p></qti-html-content></qti-card>`,
    `<qti-card support="spoken"><qti-card-entry data-reading-type="computer-read-aloud" default="true"><qti-html-content><p>${cardText(id, "spoken")}</p></qti-html-content></qti-card-entry></qti-card>`,
    "</qti-catalog>",
  ].join("");

/**
 * The item: a Choice whose root, prompt and first choice each name a catalog, a paragraph that
 * names one, and five parts the page may not be given that each name one of their own: a feedback
 * block and a feedback inline shown when `FEEDBACK` is `B`, a template block and a choice shown
 * when `VARIANT` is `C`, and a rubric block for the scorer alone.
 */
export const shownCatalogsXml = [
  '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="catalog-shown" title="Catalogs the page is given" adaptive="false" time-dependent="false" xml:lang="en">',
  '<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"><qti-correct-response><qti-value>B</qti-value></qti-correct-response></qti-response-declaration>',
  '<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>',
  '<qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier"/>',
  '<qti-template-declaration identifier="VARIANT" cardinality="single" base-type="identifier"/>',
  "<qti-item-body>",
  '<p data-catalog-idref="paragraph">A prism splits white light into colours.</p>',
  '<qti-rubric-block use="scoring" view="scorer"><qti-content-body><p>Credit <span data-catalog-idref="rubric">violet</span> alone.</p></qti-content-body></qti-rubric-block>',
  '<qti-choice-interaction response-identifier="RESPONSE" max-choices="1" data-catalog-idref="interaction">',
  '<qti-prompt data-catalog-idref="prompt">Which colour bends most?</qti-prompt>',
  '<qti-simple-choice identifier="A" data-catalog-idref="choice">Red</qti-simple-choice>',
  '<qti-simple-choice identifier="B">Violet</qti-simple-choice>',
  '<qti-simple-choice identifier="C" template-identifier="VARIANT" show-hide="show" data-catalog-idref="hidden">Indigo</qti-simple-choice>',
  "</qti-choice-interaction>",
  '<qti-feedback-block outcome-identifier="FEEDBACK" identifier="B"><qti-content-body><p>Correct: <span data-catalog-idref="block">violet</span> bends most.</p></qti-content-body></qti-feedback-block>',
  '<p>Remember <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="B"><span data-catalog-idref="inline">the shortest wave</span></qti-feedback-inline>.</p>',
  '<qti-template-block template-identifier="VARIANT" identifier="C"><qti-content-body><p>Think of a <span data-catalog-idref="template">rainbow</span>.</p></qti-content-body></qti-template-block>',
  "</qti-item-body>",
  "<qti-catalog-info>",
  ...catalogIds.map(catalogXml),
  "</qti-catalog-info>",
  '<qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>',
  "</qti-assessment-item>",
].join("");

/**
 * What a walk takes: the redaction under test, plate's or a mutant copy's, the copy of the kept
 * catalogs into the payload, and the accepted item, opened as the caller opens it.
 */
export interface Subject {
  readonly accepted: Accepted;
  readonly copyItemContent: typeof copyItemContent;
  readonly redact: typeof redact;
}

/**
 * A single identifier value.
 *
 * @param name The identifier.
 * @returns The value.
 */
const identifierValue = (name: string): Value => ({
  baseType: "identifier",
  cardinality: "single",
  values: [{ baseType: "identifier", value: name }],
});

/**
 * The two showings the walk renders under: `hidden`, a page with no record that shows no
 * feedback, as a candidate answers; and `shown`, a page that shows feedback by a record whose
 * `FEEDBACK` is `B` and whose `VARIANT` is `C`, so every part but the scorer's rubric is given.
 */
const showings: readonly (readonly ["hidden" | "shown", Showing])[] = [
  ["hidden", { showFeedback: false }],
  [
    "shown",
    {
      record: {
        attempt: "submitted",
        defaults: {},
        outcomes: { FEEDBACK: identifierValue("B") },
        templates: { VARIANT: identifierValue("C") },
      },
      showFeedback: true,
    },
  ],
];

/**
 * The support sets the walk renders under: each support alone, and all four.
 */
const supportSets: readonly (readonly CatalogSupport[])[] = [
  ...supportsHeld.map((support) => [support]),
  supportsHeld,
];

/**
 * Give the catalogs the rule keeps under a showing: those whose naming part the page is given.
 *
 * @param showing The showing's name.
 * @returns The catalogs' ids, sorted.
 */
export const keptByRule = (showing: "hidden" | "shown"): readonly string[] =>
  [...catalogs]
    .filter(([, given]) => given === "always" || (given === "shown" && showing === "shown"))
    .map(([id]) => id)
    .toSorted();

/**
 * Walk every support set under both showings and hold the redaction to the rule: the page's
 * catalogs are exactly the rule's, and no card text of another catalog is anywhere in the
 * redacted item's catalog content, the copy a host could send a page.
 *
 * @param subject The redaction under test and the item.
 * @returns The first case the redaction breaks the rule in, in words; none when it keeps the rule
 *   throughout.
 */
export const walkShownCatalogs = (subject: Subject): Option.Option<string> => {
  const configuration = Effect.runSync(configure({ seed: "" }));
  for (const names of supportSets) {
    const supports: Supports = { ...noSupports, catalog: new Set(names) };
    for (const [name, showing] of showings) {
      const redacted = subject.redact(
        subject.accepted,
        { configuration, supports, view: defaultView },
        showing,
      );
      const infos = subject.copyItemContent(redacted.content)["qti-catalog-info"];
      const kept = infos.flatMap((info) => info.catalogs.map((catalog) => catalog.id)).toSorted();
      const expected = keptByRule(name);
      const label = `${names.join("+")}, ${name}`;
      if (JSON.stringify(kept) !== JSON.stringify(expected)) {
        return Option.some(
          `${label}: kept ${JSON.stringify(kept)}, the rule keeps ${JSON.stringify(expected)}`,
        );
      }

      const json = JSON.stringify(redacted.content["qti-catalog-info"]);
      const leaked = catalogIds.flatMap((id) =>
        expected.includes(id)
          ? []
          : supportsHeld
              .map((support) => cardText(id, support))
              .filter((text) => json.includes(text)),
      );
      if (leaked.length > 0) {
        return Option.some(`${label}: the redacted item holds ${leaked.join(", ")}`);
      }
    }
  }

  return Option.none();
};
