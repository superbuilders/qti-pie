import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { CatalogFile } from "#plate/content/catalog-info.ts";
import { copyItemContent } from "#plate/content/modules.ts";
import { redact } from "#plate/redact.ts";
import type { Redacted } from "#plate/redact/walk.ts";
import { noSupports } from "#plate/supports.ts";
import type { CatalogSupport, ExtensionSupport, Supports } from "#plate/supports.ts";
import { feedbackHidden, shownToCandidate, textOf } from "#plate/test/page.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The text of the `tide` catalog's `additional-directions` card.
 */
const directions = "Read the passage twice before you choose a pool.";

/**
 * The text of the `tide` catalog's `ext:pacing` card, a support outside the predefined vocabulary.
 */
const pacing = "Take a short pause after the passage.";

/**
 * The `keyword-translation` entry written `xml:lang="es"`.
 */
const spanish = "poza de marea";

/**
 * The `keyword-translation` entry written `xml:lang="de"`, the one designated default.
 */
const german = "Gezeitentümpel";

/**
 * The `spoken` entry written `data-reading-type="screen-reader"`.
 */
const screenReader = "A rock hollow that keeps sea water, for the screen reader.";

/**
 * The `spoken` entry written `data-reading-type="computer-read-aloud"`.
 */
const readAloud = "A rock hollow that keeps sea water, read aloud by the computer.";

/**
 * The `braille` entry written `data-braille-type="ueb"`.
 */
const unifiedBraille = "Tide pool, in Unified English Braille.";

/**
 * The text of the `tide` catalog's `glossary-on-screen` card, whose `sea water` names the `nested`
 * catalog by a `data-catalog-idref` of its own.
 */
const glossary = "A hollow in the rock that keeps sea water at low tide.";

/**
 * The text of the `unreferenced` catalog's card: no element of the body names that catalog.
 */
const unreferenced = "Directions for a catalog the body never names.";

/**
 * The text of the `nested` catalog's card: only the glossary card's content names that catalog.
 */
const nested = "Directions for a catalog only a card names.";

/**
 * Every text a card of {@link catalogItem} holds, each dormant until a support makes it active.
 */
const cardTexts = [
  directions,
  pacing,
  spanish,
  german,
  screenReader,
  readAloud,
  unifiedBraille,
  glossary,
  unreferenced,
  nested,
] as const;

/**
 * An item whose body names two of its four catalogs: `tide` from two elements, one of whose
 * `data-catalog-idref` carries white space an `xs:IDREF` collapses, and `chart` from one. The
 * `unreferenced` catalog is named nowhere, and `nested` only inside a `tide` card's content.
 *
 * The `tide` catalog holds a card for each kind of resolution the information model names: direct
 * HTML content (`additional-directions`, `ext:pacing`, `glossary-on-screen`), entries told apart by
 * their language (`keyword-translation`, one designated default by `1`; `sign-language`, files
 * only, none designated default), entries told apart by custom `data-*` attributes (`spoken`,
 * `braille`), and an empty card (`transcript`). The `chart` catalog's one card is a file
 * reference. Its `qti-catalog-info` stands after the body and before response processing, where
 * `AssessmentItemDType`'s sequence places it.
 */
const catalogItem = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="catalog-resolution"
  title="Catalog resolution" adaptive="false" time-dependent="false" xml:lang="en">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>B</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-item-body>
    <p data-catalog-idref="tide">A tide pool keeps sea water in a hollow of the rock.</p>
    <p data-catalog-idref="chart">The chart compares the depth of three pools at low tide.</p>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-prompt>Which <span data-catalog-idref=" tide ">tide pool</span> is deepest?</qti-prompt>
      <qti-simple-choice identifier="A">The north pool</qti-simple-choice>
      <qti-simple-choice identifier="B">The middle pool</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-catalog-info>
    <qti-catalog id="tide">
      <qti-card support="additional-directions">
        <qti-html-content><p>${directions}</p></qti-html-content>
      </qti-card>
      <qti-card support="ext:pacing">
        <qti-html-content><p>${pacing}</p></qti-html-content>
      </qti-card>
      <qti-card support="keyword-translation" xml:lang="en">
        <qti-card-entry xml:lang="es">
          <qti-html-content><p>${spanish}</p></qti-html-content>
        </qti-card-entry>
        <qti-card-entry xml:lang="de" default="1">
          <qti-html-content><p>${german}</p></qti-html-content>
        </qti-card-entry>
      </qti-card>
      <qti-card support="sign-language">
        <qti-card-entry xml:lang="ase">
          <qti-file-href mime-type="video/mp4">signs/ase.mp4</qti-file-href>
        </qti-card-entry>
        <qti-card-entry xml:lang="bfi">
          <qti-file-href mime-type="video/mp4">signs/bfi.mp4</qti-file-href>
        </qti-card-entry>
      </qti-card>
      <qti-card support="spoken">
        <qti-card-entry data-reading-type="screen-reader">
          <qti-html-content><p>${screenReader}</p></qti-html-content>
        </qti-card-entry>
        <qti-card-entry data-reading-type="computer-read-aloud">
          <qti-html-content><p>${readAloud}</p></qti-html-content>
        </qti-card-entry>
      </qti-card>
      <qti-card support="braille">
        <qti-card-entry data-braille-type="ueb">
          <qti-html-content><p>${unifiedBraille}</p></qti-html-content>
        </qti-card-entry>
      </qti-card>
      <qti-card support="glossary-on-screen" xml:lang="en">
        <qti-html-content>
          <p>A hollow in the rock that keeps <span data-catalog-idref="nested">sea water</span> at low tide.</p>
        </qti-html-content>
      </qti-card>
      <qti-card support="transcript"/>
    </qti-catalog>
    <qti-catalog id="chart">
      <qti-card support="long-description">
        <qti-file-href mime-type="text/html">descriptions/chart.html</qti-file-href>
      </qti-card>
    </qti-catalog>
    <qti-catalog id="unreferenced">
      <qti-card support="additional-directions">
        <qti-html-content><p>${unreferenced}</p></qti-html-content>
      </qti-card>
    </qti-catalog>
    <qti-catalog id="nested">
      <qti-card support="additional-directions">
        <qti-html-content><p>${nested}</p></qti-html-content>
      </qti-card>
    </qti-catalog>
  </qti-catalog-info>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"/>
</qti-assessment-item>`;

/**
 * One active card as a page is given it: its `support`, the text its content holds, collapsed, the
 * language that content is in, and its files.
 */
interface ShownCard {
  readonly files: readonly CatalogFile[];
  readonly lang: Option.Option<string>;
  readonly support: string;
  readonly text: string;
}

/**
 * One catalog a page is given: its `id`, how many elements of the body name it, and its active
 * cards in document order.
 */
interface ShownCatalog {
  readonly cards: readonly ShownCard[];
  readonly id: string;
  readonly references: number;
}

/**
 * What one candidate is shown of the item's catalogs: the redacted item a host sends to a page,
 * and the catalogs of the payload the page is given.
 */
interface Shown {
  readonly catalogs: readonly ShownCatalog[];
  readonly redacted: Redacted;
}

/**
 * Open {@link catalogItem} through the checking entry and take its accepted item, failing the test
 * when `admitted` accepts none.
 */
const accepted: Effect.Effect<Accepted> = Effect.gen(function* acceptCatalogItem() {
  const verdict = yield* admitted("items/catalog.xml", new TextEncoder().encode(catalogItem));

  return Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`admitted gave ${verdict.verdict}: ${JSON.stringify(verdict)}`),
  );
});

/**
 * Give the catalogs a page is given, as the server shell reads them of the redacted item (each
 * through its module's `copy`), each card's content as its collapsed text.
 *
 * @param redacted The redacted item.
 * @returns The catalogs, in document order; empty when the redacted item holds none.
 */
const catalogsOf = (redacted: Redacted): readonly ShownCatalog[] =>
  copyItemContent(redacted.content)["qti-catalog-info"].flatMap((info) =>
    info.catalogs.map((catalog) => ({
      cards: catalog.cards.map((card) => ({
        files: card.files,
        lang: card.lang,
        support: card.support,
        text: textOf(card.content),
      })),
      id: catalog.id,
      references: catalog.references,
    })),
  );

/**
 * Redact the item for a candidate under the supports, as the server shell does.
 *
 * @param supports The supports the host enabled.
 * @returns The redacted item and the page's catalogs.
 */
const shownUnder = Effect.fnUntraced(function* shownUnder(supports: Supports) {
  const redacted = redact(yield* accepted, { ...shownToCandidate, supports }, feedbackHidden);

  return { catalogs: catalogsOf(redacted), redacted } satisfies Shown;
});

/**
 * Build the supports that enable catalog supports and nothing else, with any other field set.
 *
 * @param names The catalog supports enabled.
 * @param fields The other fields, `noSupports`'s where absent.
 * @returns The supports.
 */
const enabling = (
  names: readonly (CatalogSupport | ExtensionSupport)[],
  fields: Partial<Omit<Supports, "catalog">> = {},
): Supports => ({ ...noSupports, ...fields, catalog: new Set(names) });

/**
 * Give the text the redacted item holds of the catalogs, as the JSON a host could send a page: the
 * oracle that dormant content is withheld from the copy, not only from what a page shows.
 *
 * @param redacted The redacted item.
 * @returns The JSON text of its catalog content, empty when it holds none.
 */
const redactedCatalogText = (redacted: Redacted): string =>
  JSON.stringify(redacted.content["qti-catalog-info"]);

/**
 * A card holding HTML content and no file, in no language of its own.
 *
 * @param support The card's `support`.
 * @param text The text its content holds.
 * @returns The card as a page is given it.
 */
const htmlCard = (support: string, text: string): ShownCard => ({
  files: [],
  lang: Option.none(),
  support,
  text,
});

/**
 * Assert that a candidate is shown exactly one active card, in the `tide` catalog, and that no
 * other card's text reaches the redacted item.
 *
 * @param shown What the candidate is shown.
 * @param card The one card.
 */
const showsOnlyTide = (shown: Shown, card: ShownCard): void => {
  assert.deepStrictEqual(shown.catalogs, [{ cards: [card], id: "tide", references: 2 }]);

  const json = redactedCatalogText(shown.redacted);
  for (const text of cardTexts) {
    if (text === card.text) {
      assert.include(json, text);
    } else {
      assert.notInclude(json, text);
    }
  }
};

describe("catalog resolution, held to the information model's Catalog, Card and CardEntry classes", () => {
  it.effect(
    'keeps every card dormant with no support enabled: CatalogInfo is "not included for delivery to candidates by default" (5.29)',
    () =>
      Effect.gen(function* dormant() {
        const shown = yield* shownUnder(noSupports);

        assert.deepStrictEqual(shown.catalogs, []);
        assert.deepStrictEqual(shown.redacted.content["qti-catalog-info"], []);
      }),
  );

  it.effect(
    'makes a card active for the support it names, "for whom the dormant content is intended" (5.26.1), predefined or ext: (7.37)',
    () =>
      Effect.gen(function* bySupport() {
        showsOnlyTide(
          yield* shownUnder(enabling(["additional-directions"])),
          htmlCard("additional-directions", directions),
        );
        showsOnlyTide(yield* shownUnder(enabling(["ext:pacing"])), htmlCard("ext:pacing", pacing));
      }),
  );

  it.effect(
    "makes every card active whose support is enabled, a card of file references with its files (5.26.1, 5.26.3)",
    () =>
      Effect.gen(function* everyEnabled() {
        const shown = yield* shownUnder(
          enabling(["long-description", "ext:pacing", "additional-directions"]),
        );

        assert.deepStrictEqual(shown.catalogs, [
          {
            cards: [htmlCard("additional-directions", directions), htmlCard("ext:pacing", pacing)],
            id: "tide",
            references: 2,
          },
          {
            cards: [
              {
                files: [{ href: "descriptions/chart.html", mimeType: "text/html" }],
                lang: Option.none(),
                support: "long-description",
                text: "",
              },
            ],
            id: "chart",
            references: 1,
          },
        ]);
      }),
  );

  it.effect(
    "makes nothing active for an enabled support no card of a catalog addresses (5.28: each card addresses a specific support)",
    () =>
      Effect.gen(function* noCard() {
        const shown = yield* shownUnder(enabling(["high-contrast", "tactile"]));

        assert.deepStrictEqual(shown.catalogs, []);
        assert.deepStrictEqual(shown.redacted.content["qti-catalog-info"], []);
      }),
  );

  it.effect(
    'locates a catalog only from the content body, by the data-catalog-idref "which matches the catalog\'s identifier" (5.28, 5.28.1)',
    () =>
      Effect.gen(function* byReference() {
        const shown = yield* shownUnder(enabling(["additional-directions"]));
        const json = redactedCatalogText(shown.redacted);

        assert.deepStrictEqual(
          shown.catalogs.map((catalog) => catalog.id),
          ["tide"],
        );
        assert.notInclude(json, unreferenced);
        assert.notInclude(json, nested);
      }),
  );

  it.effect(
    "counts each element of the content body that names a catalog, its xs:IDREF collapsed, and none inside card content",
    () =>
      Effect.gen(function* counted() {
        const shown = yield* shownUnder(enabling(["additional-directions", "long-description"]));

        assert.deepStrictEqual(
          shown.catalogs.map(({ id, references }) => [id, references]),
          [
            ["tide", 2],
            ["chart", 1],
          ],
        );
      }),
  );

  it.effect(
    "gives the entry whose attribute aligns with the candidate's PNP (5.27): keyword-translation and sign-language by xml:lang",
    () =>
      Effect.gen(function* byLanguage() {
        showsOnlyTide(
          yield* shownUnder(
            enabling(["keyword-translation"], { keywordTranslationLanguage: Option.some("es") }),
          ),
          { files: [], lang: Option.some("es"), support: "keyword-translation", text: spanish },
        );
        assert.deepStrictEqual(
          (yield* shownUnder(enabling(["sign-language"], { signLanguage: Option.some("bfi") })))
            .catalogs,
          [
            {
              cards: [
                {
                  files: [{ href: "signs/bfi.mp4", mimeType: "video/mp4" }],
                  lang: Option.some("bfi"),
                  support: "sign-language",
                  text: "",
                },
              ],
              id: "tide",
              references: 2,
            },
          ],
        );
      }),
  );

  it.effect(
    "gives the entry whose data-* attribute aligns with the candidate's PNP (5.27): spoken by reading-type, braille by braille-type",
    () =>
      Effect.gen(function* byParameter() {
        showsOnlyTide(
          yield* shownUnder(enabling(["spoken"], { readAloud: Option.some("screen-reader") })),
          htmlCard("spoken", screenReader),
        );
        showsOnlyTide(
          yield* shownUnder(
            enabling(["spoken"], { readAloud: Option.some("computer-read-aloud") }),
          ),
          htmlCard("spoken", readAloud),
        );
        showsOnlyTide(
          yield* shownUnder(
            enabling(["braille"], {
              braille: Option.some({
                brailleType: Option.some("ueb"),
                deliveryMode: "refreshable",
                grade: 2,
                language: Option.none(),
                mathType: Option.none(),
              }),
            }),
          ),
          htmlCard("braille", unifiedBraille),
        );
      }),
  );

  it.effect(
    'gives the entry designated default "if the CardEntry attribute values do not identify the proper content" (5.27.2)',
    () =>
      Effect.gen(function* defaulted() {
        const germanCard: ShownCard = {
          files: [],
          lang: Option.some("de"),
          support: "keyword-translation",
          text: german,
        };

        showsOnlyTide(yield* shownUnder(enabling(["keyword-translation"])), germanCard);
        showsOnlyTide(
          yield* shownUnder(
            enabling(["keyword-translation"], { keywordTranslationLanguage: Option.some("fr") }),
          ),
          germanCard,
        );
      }),
  );

  it.effect(
    'keeps a card dormant when no entry aligns and none is designated default, whose default is "false" (5.27.2)',
    () =>
      Effect.gen(function* undesignated() {
        for (const supports of [
          enabling(["spoken"]),
          enabling(["sign-language"]),
          enabling(["sign-language"], { signLanguage: Option.some("fsl") }),
          enabling(["braille"]),
        ]) {
          const shown = yield* shownUnder(supports);

          assert.deepStrictEqual(shown.catalogs, []);
          assert.deepStrictEqual(shown.redacted.content["qti-catalog-info"], []);
        }
      }),
  );

  it.effect(
    "gives the language of the content presented, the chosen entry's xml:lang over its card's (5.26.2, 5.27.1)",
    () =>
      Effect.gen(function* language() {
        const glossaryShown = yield* shownUnder(enabling(["glossary-on-screen"]));

        assert.deepStrictEqual(
          glossaryShown.catalogs.flatMap((catalog) => catalog.cards.map((card) => card.lang)),
          [Option.some("en")],
        );
        assert.deepStrictEqual(
          (yield* shownUnder(
            enabling(["keyword-translation"], { keywordTranslationLanguage: Option.some("es") }),
          )).catalogs.flatMap((catalog) => catalog.cards.map((card) => card.lang)),
          [Option.some("es")],
        );
      }),
  );

  it.effect(
    "shows nothing of a card that holds neither HTML content nor a file, which reading 31 admits",
    () =>
      Effect.gen(function* empty() {
        const shown = yield* shownUnder(enabling(["transcript"]));

        assert.deepStrictEqual(shown.catalogs, []);
        assert.deepStrictEqual(shown.redacted.content["qti-catalog-info"], []);
      }),
  );
});
