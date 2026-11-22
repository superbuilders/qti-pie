/**
 * Plate's UI suite over read-aloud in a shared stimulus: a passage whose paragraph names a catalog
 * holding one `spoken` card with a pre-recorded reading, referenced by an item in another folder of
 * its package, opened as content the database admitted and shown as a host shows it, under the
 * candidate's supports and without them, and in review.
 *
 * Each rule is read from the page against the specification it cites, never against plate's code:
 *
 * - SR1, dormant: with no support enabled the passage holds no read-aloud control: "Content inside
 *   CatalogInfo is considered 'dormant' and is not included for delivery to candidates by default"
 *   (information model §5.29).
 * - SR2, the passage's own catalog: with the `spoken` support at the reading type
 *   `computer-read-aloud`, the paragraph that names the passage's catalog has one control, right
 *   before it in the passage's article, at its top, and the paragraph that names none has none: the
 *   stimulus's `qti-catalog-info` is "The alternative accessibility information that is to be
 *   associated with the content in the stimulus body" (§4.3.10), and "A catalog is referenced from
 *   a specific portion of the content body by a specific, unique identifier" (§5.28).
 * - SR3, the recording from the passage's own document: the control's `audio` holds the card's file
 *   at the address of the path its `qti-file-href` names from the stimulus's own directory (RFC
 *   3986 §5.2), `stimuli/audio/passage-1.mp3`, never from the item's (`items/`), with its
 *   `mime-type` (§7.15.1): "the shared stimulus content must be supplied in the same context for
 *   each of the Assessment Items that make use of it" (§4.3).
 * - SR4, operable and named: the control is a native `button` with `aria-pressed` and an accessible
 *   name (WCAG 2.1.1, 4.1.2).
 * - SR5, review: a review ships no island but a Media's replay (the suite's J1), so the passage holds
 *   no control there.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { parseHTML } from "linkedom";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { acceptedItem, acceptedStimulus, configure } from "@qti-pie/plate";
import { admitted } from "@qti-pie/plate/test/admitted";
import { Item } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { Responses } from "@qti-pie/plate/ui/client";
import { factsOf } from "#specimen/ui/rendered.ts";
import { instance } from "#specimen/ui/rules.ts";

/**
 * The passage's recording, by its path in the package: `audio/passage-1.mp3` from `stimuli/`.
 */
const recording = "stimuli/audio/passage-1.mp3";

/**
 * The passage: two paragraphs, the first naming the catalog of one `spoken` card whose entry for
 * `computer-read-aloud` holds a recording, the second naming no catalog.
 */
const stimulusXml = `<qti-assessment-stimulus xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="passage" title="Liang and Bao" xml:lang="en">
  <qti-stimulus-body>
    <p data-catalog-idref="tts-passage-1">Liang was standing in the hallway when she saw her younger brother, Bao.</p>
    <p>He did not see her at first.</p>
  </qti-stimulus-body>
  <qti-catalog-info>
    <qti-catalog id="tts-passage-1">
      <qti-card support="spoken"><qti-card-entry data-reading-type="computer-read-aloud"><qti-file-href mime-type="audio/mpeg">audio/passage-1.mp3</qti-file-href></qti-card-entry></qti-card>
    </qti-catalog>
  </qti-catalog-info>
</qti-assessment-stimulus>
`;

/**
 * The item that references the passage from another folder of the package.
 */
const itemXml = `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="passage_question" title="Liang and Bao, question 1" adaptive="false" time-dependent="false" xml:lang="en">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-assessment-stimulus-ref identifier="passage" href="../stimuli/passage.xml"/>
  <qti-item-body>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-prompt><p>Where was Liang standing?</p></qti-prompt>
      <qti-simple-choice identifier="A"><p>In the hallway</p></qti-simple-choice>
      <qti-simple-choice identifier="B"><p>In the classroom</p></qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>
`;

/**
 * The supports a showing enables: none, or the `spoken` catalog support at `computer-read-aloud`,
 * every other support off.
 *
 * @param spoken Whether the candidate hears content read aloud.
 * @returns The supports.
 */
const supportsOf = (spoken: boolean): NonNullable<ItemProps["supports"]> => ({
  braille: Option.none(),
  catalog: spoken ? new Set(["spoken"] as const) : new Set(),
  display: { invertDisplayPolarity: false, keywordEmphasis: false, magnification: Option.none() },
  keywordTranslationLanguage: Option.none(),
  readAloud: spoken ? Option.some("computer-read-aloud") : Option.none(),
  signLanguage: Option.none(),
});

/**
 * The address the configuration gives the recording.
 */
const recordingAddress = "/media/passage-1.mp3";

/**
 * The item and the passage as a host opens them, both accepted from the database's admitted set,
 * the recording's address alone in `assets`, so a recording resolved against the item's folder
 * names a file the configuration gives no address.
 */
const opened = Effect.gen(function* openedDocuments() {
  const item = yield* Effect.fromOption(
    acceptedItem(yield* admitted("items/passage-question.xml", new TextEncoder().encode(itemXml))),
  );
  const stimulus = yield* Effect.fromOption(
    acceptedStimulus(yield* admitted("stimuli/passage.xml", new TextEncoder().encode(stimulusXml))),
  );
  const configuration = yield* configure({
    assets: [[recording, recordingAddress]],
    seed: "stimulus-read-aloud",
  });

  return { configuration, item, stimulus };
}).pipe(Effect.orDie);

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {
  // A server render runs no event handler.
};

/**
 * Render the item with its passage and parse the passage's article.
 *
 * @param mode The mode.
 * @param spoken Whether the `spoken` support is enabled.
 * @returns The article, and the page's controls as the suite reads them.
 */
const passageOf = (mode: "answering" | "review", spoken: boolean) =>
  opened.pipe(
    Effect.map(({ configuration, item, stimulus }) => {
      const props: ItemProps = {
        configuration,
        instance,
        item,
        mode,
        stimuli: [stimulus],
        supports: supportsOf(spoken),
      };
      const rendered = createElement(Item, props);
      const html = renderToStaticMarkup(
        mode === "answering"
          ? createElement(Responses, { children: rendered, onChange: keepNothing, value: [] })
          : rendered,
      );
      const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
      const article = document.querySelector('[data-slot="plate-stimulus"]');
      assert.isNotNull(article, "the passage stands on the page");

      return { article, facts: factsOf(html) };
    }),
  );

/**
 * The read-aloud controls inside an element, in document order.
 *
 * @param element The element.
 * @returns Each control's part.
 */
const controlsIn = (element: Element): readonly Element[] => [
  ...element.querySelectorAll('[data-slot="plate-read-aloud"]'),
];

describe("read-aloud in a shared stimulus", () => {
  it.effect("SR1: with no support enabled the passage holds no read-aloud control", () =>
    Effect.map(passageOf("answering", false), ({ article }) => {
      assert.lengthOf(controlsIn(article), 0);
    }),
  );

  it.effect(
    "SR2-SR4: the paragraph that names the passage's catalog has one named control right before it, playing the file its card names from the passage's own folder",
    () =>
      Effect.map(passageOf("answering", true), ({ article, facts }) => {
        const controls = controlsIn(article);
        assert.lengthOf(controls, 1, "one control, for the one paragraph that names a catalog");

        const [control] = controls;
        assert.isDefined(control);

        const after = control.nextElementSibling;
        assert.strictEqual(after?.tagName.toLowerCase(), "p");
        assert.include(after?.textContent ?? "", "Liang was standing in the hallway");
        assert.isNull(
          control.previousElementSibling?.querySelector('[data-slot="plate-read-aloud"]') ?? null,
        );

        const sources = [...control.querySelectorAll("audio > source")].map((source) => ({
          src: source.getAttribute("src"),
          type: source.getAttribute("type"),
        }));
        assert.deepStrictEqual(sources, [{ src: recordingAddress, type: "audio/mpeg" }]);

        const button = control.querySelector("button");
        assert.isNotNull(button);
        assert.isNotNull(button.getAttribute("aria-pressed"));
        assert.isTrue(
          facts.controls.every((each) => each.name !== ""),
          "every control on the page has an accessible name",
        );
      }),
  );

  it.effect("SR5: a review holds no read-aloud control in the passage", () =>
    Effect.map(passageOf("review", true), ({ article }) => {
      assert.lengthOf(controlsIn(article), 0);
    }),
  );
});
