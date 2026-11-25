/**
 * Plate's UI suite over read-aloud: the AlphaTest port's read-aloud item, a Choice whose stem
 * block, prompt and each choice name a catalog holding one `spoken` card with a pre-recorded
 * reading (implementation guide §5.2.8.3), opened as content the database admitted and shown while
 * the candidate answers, under the candidate's supports and without them, and in review.
 *
 * Each rule is read from the page against the specification it cites, never against plate's code:
 *
 * - RA1, dormant: with no support enabled the page holds no read-aloud control, no recording and no
 *   listing of a card: "Content inside CatalogInfo is considered 'dormant' and is not included for
 *   delivery to candidates by default" (information model §5.29).
 * - RA2, one control per reference: with the `spoken` support at the reading type
 *   `computer-read-aloud`, each part that names a catalog by `data-catalog-idref` has its one
 *   control, and nothing else does: "A catalog is referenced from a specific portion of the content
 *   body by a specific, unique identifier, which matches the catalog's identifier" (§5.28).
 * - RA3, beside what it reads: the stem's control stands before the stem, at its top, as AlphaTest's
 *   player put a question's control, the prompt's follows the prompt, and each choice's stands
 *   beside that choice's option, outside its `label`, which holds no labelable element but its own
 *   control (HTML, the `label` element's content model).
 * - RA4, the recording: each control's `audio` holds one `source` per audio file of its card's entry,
 *   the file's address in the configuration's `assets` and its `mime-type` (§7.15.1), so the
 *   browser plays the file the card names (§5.26.3).
 * - RA5, operable and named: each control is a native `button`, which Tab reaches and Enter and Space
 *   press (WCAG 2.1.1), with `aria-pressed` for whether it plays (WAI-ARIA 1.2, `button`'s pressed
 *   state) and an accessible name no other control on the page shares (WCAG 2.4.6), by the
 *   Accessible Name computation as HTML-AAM gives it; and the page keeps I1, I2 and A1.
 * - RA6, the entry chosen: under the reading type `screen-reader`, a card whose entry is the default
 *   still gives its recording ("If the CardEntry attribute values do not identify the proper
 *   content for a candidate, use the content designated as default", §5.27.2), and one whose only
 *   entry is for `computer-read-aloud` and no default gives nothing.
 * - RA7, review: a review ships no island but a Media's replay (the suite's J1), so it holds no
 *   control and lists no recording.
 *
 * @module
 */
import { regex } from "arkregex";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { parseHTML } from "linkedom";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { acceptedItem, configure, startingResponses } from "@qti-pie/plate";
import type { Accepted, Configuration } from "@qti-pie/plate";
import { admitted } from "@qti-pie/plate/test/admitted";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
import { clientExports } from "#specimen/ui/clients.ts";
import { factsOf, islandsIn } from "#specimen/ui/rendered.ts";

/**
 * The supports a host enables for one candidate, `<Item>`'s `supports`.
 */
type Supports = NonNullable<ItemProps["supports"]>;

/**
 * The instance every page of the test renders under.
 */
const instance = "suite";

/**
 * Each recording's package path, `media/` and the SHA-256 of its bytes, as the port's media ETL
 * names it, by the part it reads.
 */
const recordings = {
  optionA: "media/8a1f2c0d9e4b7a6c5d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c.mp3",
  optionB: "media/0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff0.mp3",
  prompt: "media/58a84aee5484e2177c11a531daed78a8a66bac4158a84aee5484e2177c11a531.mp3",
  stem: "media/9e4c1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7.mp3",
} as const;

/**
 * The address the configuration's `assets` gives a recording: the CDN's, by its digest.
 *
 * @param path The recording's package path.
 * @returns Its address.
 */
const addressOf = (path: string): string =>
  `https://cdn.edullm.ai/sha256/${path.slice("media/".length, -".mp3".length)}`;

/**
 * The port's read-aloud item. The stem's card holds its recording for `computer-read-aloud` with no
 * default, and every other card's entry is the default, so RA6 reads both.
 */
const itemXml = `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="read_aloud" title="Read aloud" adaptive="false" time-dependent="false" xml:lang="en-US">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>B</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-item-body>
    <div data-catalog-idref="tts-stem"><p>Canada and the United States share four of the five Great Lakes.</p></div>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-prompt data-catalog-idref="tts-prompt"><p>Which lake is entirely within the United States?</p></qti-prompt>
      <qti-simple-choice identifier="A" data-catalog-idref="tts-option-A"><p>Erie</p></qti-simple-choice>
      <qti-simple-choice identifier="B" data-catalog-idref="tts-option-B"><p>Michigan</p></qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-catalog-info>
    <qti-catalog id="tts-stem">
      <qti-card support="spoken"><qti-card-entry data-reading-type="computer-read-aloud"><qti-file-href mime-type="audio/mpeg">${recordings.stem}</qti-file-href></qti-card-entry></qti-card>
    </qti-catalog>
    <qti-catalog id="tts-prompt">
      <qti-card support="spoken"><qti-card-entry data-reading-type="computer-read-aloud" default="true"><qti-file-href mime-type="audio/mpeg">${recordings.prompt}</qti-file-href></qti-card-entry></qti-card>
    </qti-catalog>
    <qti-catalog id="tts-option-A">
      <qti-card support="spoken"><qti-card-entry data-reading-type="computer-read-aloud" default="true"><qti-file-href mime-type="audio/mpeg">${recordings.optionA}</qti-file-href></qti-card-entry></qti-card>
    </qti-catalog>
    <qti-catalog id="tts-option-B">
      <qti-card support="spoken"><qti-card-entry data-reading-type="computer-read-aloud" default="true"><qti-file-href mime-type="audio/mpeg">${recordings.optionB}</qti-file-href></qti-card-entry></qti-card>
    </qti-catalog>
  </qti-catalog-info>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>
`;

/**
 * The item's location in its package, at its root, so each recording's href, resolved against it
 * (RFC 3986 §5.2), is the recording's own package path.
 */
const location = "read-aloud.xml";

/**
 * The supports of a candidate who hears content read aloud, at a reading type: the `spoken`
 * catalog support enabled, every other support off.
 *
 * @param readingType The spoken support's reading type.
 * @returns The supports.
 */
const spokenAt = (readingType: "computer-read-aloud" | "screen-reader"): Supports => ({
  braille: Option.none(),
  catalog: new Set(["spoken"]),
  display: { invertDisplayPolarity: false, keywordEmphasis: false, magnification: Option.none() },
  keywordTranslationLanguage: Option.none(),
  readAloud: Option.some(readingType),
  signLanguage: Option.none(),
});

/**
 * The item as a host opens it: accepted from the database's admitted set, its recordings' addresses
 * in `assets`, configured once.
 */
const opened: Effect.Effect<{
  readonly accepted: Accepted;
  readonly configuration: Configuration;
}> = Effect.gen(function* openedItem() {
  const verdict = yield* admitted(location, new TextEncoder().encode(itemXml));
  const accepted = yield* Effect.fromOption(acceptedItem(verdict));
  const configuration = yield* configure({
    assets: Object.values(recordings).map((path) => [path, addressOf(path)] as const),
    seed: "read-aloud",
  });

  return { accepted, configuration };
}).pipe(Effect.orDie);

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {
  // A server render runs no event handler.
};

/**
 * Render the item and parse its page.
 *
 * @param mode The mode.
 * @param supports The supports enabled, none where absent.
 * @returns The page's document, its facts and its islands.
 */
const page = (mode: "answering" | "review", supports: Option.Option<Supports>) =>
  Effect.gen(function* rendered() {
    const { accepted, configuration } = yield* opened;
    const clients = yield* clientExports;
    const props: ItemProps = {
      configuration,
      instance,
      item: accepted,
      mode,
      showFeedback: false,
      ...Option.match(supports, {
        onNone: () => ({}),
        onSome: (enabled) => ({ supports: enabled }),
      }),
    };
    const item = createElement(Item, { ...props, renderers: standardRenderers });
    const html = renderToStaticMarkup(
      mode === "answering"
        ? createElement(Responses, {
            children: item,
            onChange: keepNothing,
            value: heldOf(startingResponses(accepted, props)),
          })
        : item,
    );
    const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);

    return { document, facts: factsOf(html), islands: islandsIn(item, clients) };
  });

/**
 * The selector of plate's read-aloud part, the control that plays a spoken card's recording.
 */
const readAloudPart = '[data-slot="plate-read-aloud"]';

/**
 * The read-aloud controls of a page, in document order.
 *
 * @param document The page.
 * @returns Each control's part.
 */
const controlsOf = (document: Document): readonly Element[] => [
  ...document.querySelectorAll(readAloudPart),
];

/**
 * The sources of a control's recording, each as its address and type.
 *
 * @param control The control's part.
 * @returns Its sources, in document order.
 */
const sourcesOf = (control: Element): readonly (readonly [string | null, string | null])[] =>
  [...control.querySelectorAll("audio > source")].map((source) => [
    source.getAttribute("src"),
    source.getAttribute("type"),
  ]);

/**
 * The text of an element, its white space collapsed.
 *
 * @param element The element.
 * @returns Its text.
 */
const textOf = (element: Element): string =>
  element.textContent.replaceAll(regex("\\s+", "gu"), " ").trim();

describe("read-aloud", () => {
  it.effect("RA1: with no support enabled the catalog stays dormant", () =>
    Effect.gen(function* dormant() {
      const { document } = yield* page("answering", Option.none());

      assert.deepStrictEqual(controlsOf(document), []);
      assert.strictEqual(document.querySelectorAll("audio").length, 0);
      assert.strictEqual(document.querySelectorAll('[data-slot="plate-catalog"]').length, 0);
    }),
  );

  it.effect(
    "RA2-RA5: each referencing part has one named, pressable control beside it, playing its card's file",
    () =>
      Effect.gen(function* presented() {
        const { document, facts } = yield* page(
          "answering",
          Option.some(spokenAt("computer-read-aloud")),
        );
        const controls = controlsOf(document);

        assert.strictEqual(controls.length, 4, "the stem, the prompt and the two choices");
        assert.strictEqual(document.querySelectorAll('[data-slot="plate-catalog"]').length, 0);

        const stem = document.querySelector('[data-slot="plate-item"] > div');
        const prompt = document.querySelector('[data-slot="plate-prompt"]');
        const rows = [...document.querySelectorAll('[data-slot="plate-choice-row"]')];

        assert.isTrue(
          stem?.previousElementSibling?.matches(readAloudPart),
          "the stem's control precedes it",
        );
        assert.deepStrictEqual(sourcesOf(stem.previousElementSibling), [
          [addressOf(recordings.stem), "audio/mpeg"],
        ]);
        assert.isTrue(
          prompt?.nextElementSibling?.matches(readAloudPart),
          "the prompt's control follows it",
        );
        assert.deepStrictEqual(sourcesOf(prompt.nextElementSibling), [
          [addressOf(recordings.prompt), "audio/mpeg"],
        ]);
        assert.deepStrictEqual(
          rows.map((row) => [
            textOf(row.querySelector('[data-slot="plate-choice-option"]') ?? row),
            sourcesOf(row.querySelector(readAloudPart) ?? row),
          ]),
          [
            ["Erie", [[addressOf(recordings.optionA), "audio/mpeg"]]],
            ["Michigan", [[addressOf(recordings.optionB), "audio/mpeg"]]],
          ],
        );
        assert.strictEqual(
          document.querySelectorAll(`label ${readAloudPart}`).length,
          0,
          "no control stands in a label",
        );

        const buttons = controls.map((control) => control.querySelector("button"));
        assert.isTrue(buttons.every((button) => button?.getAttribute("aria-pressed") === "false"));

        const names = facts.controls
          .filter(
            (control) => control.element.startsWith("button") && control.name.startsWith("Listen"),
          )
          .map((control) => control.name);
        assert.strictEqual(names.length, 4, JSON.stringify(facts.controls));
        assert.strictEqual(new Set(names).size, 4, `names: ${names.join(", ")}`);
        assert.isTrue(
          facts.controls.every((control) => control.name !== ""),
          "A1",
        );

        const ids = facts.ids.map((each) => each.id);
        assert.strictEqual(new Set(ids).size, ids.length, "I1");
        assert.isTrue(
          facts.references.every((reference) => ids.includes(reference.id)),
          "I2",
        );
      }),
  );

  it.effect(
    "RA6: a screen reader's entry falls back to the default, and no default gives nothing",
    () =>
      Effect.gen(function* screenReader() {
        const { document } = yield* page("answering", Option.some(spokenAt("screen-reader")));
        const stem = document.querySelector('[data-slot="plate-item"] > div');

        assert.strictEqual(controlsOf(document).length, 3, "the prompt and the two choices");
        assert.isNotTrue(
          stem?.previousElementSibling?.matches(readAloudPart),
          "the stem has no control",
        );
      }),
  );

  it.effect("RA7: a review holds no control and ships no island", () =>
    Effect.gen(function* review() {
      const { document, islands } = yield* page(
        "review",
        Option.some(spokenAt("computer-read-aloud")),
      );

      assert.deepStrictEqual(controlsOf(document), []);
      assert.deepStrictEqual(islands, []);
      assert.strictEqual(document.querySelectorAll('[data-slot="plate-catalog"]').length, 0);
    }),
  );
});
