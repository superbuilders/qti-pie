/**
 * Plate's UI suite over the names of read-aloud's controls across one item's page: an item whose
 * body holds a stem, a table whose first row's two category words each name a catalog, as a
 * picture graph's label row does, and a Gap Match whose sentence's two end labels ("least",
 * "greatest") each name one, shown with a passage whose own table's category word names one too.
 * Every catalog holds one `spoken` card with a pre-recorded reading. Opened as content the database
 * admitted and shown while the child answers, with the spoken support.
 *
 * Each rule is read from the page against the specification it cites, never against plate's code:
 *
 * - RN1, one name each: every read-aloud control on the page is a native `button` with an accessible
 *   name no other control on the page shares (WCAG 2.4.6, "Headings and labels describe topic or
 *   purpose": two controls of one name tell a screen reader's user nothing of which reads which),
 *   the passage's, the table's and the sentence's labels among them, though the page writes them
 *   from three runs of two documents.
 * - RN2, each label its own control: each category word and each end label holds one control after
 *   its words, playing its own card's file (implementation guide §5.2.8.3; information model
 *   §5.28), named by its place among the page's labels, the passage's first, as the page writes the
 *   passage before the question, then the item's in document order (spec reading 237).
 *
 * Kills: the page numbered as each walk of a run numbered its own, from 1 (the follow-on's), and as
 * each document numbered its own, both fail RN1.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { parseHTML } from "linkedom";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { acceptedItem, acceptedStimulus, configure, startingResponses } from "@qti-pie/plate";
import { admitted } from "@qti-pie/plate/test/admitted";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
import { factsOf } from "#specimen/ui/rendered.ts";
import { instance } from "#specimen/ui/rules.ts";

/**
 * A catalog of one `spoken` card whose entry for `computer-read-aloud` holds one recording.
 *
 * @param id The catalog's `id`.
 * @param href The recording's path, from its document's folder.
 * @returns The catalog's XML.
 */
const catalogOf = (id: string, href: string): string =>
  `<qti-catalog id="${id}"><qti-card support="spoken"><qti-card-entry data-reading-type="computer-read-aloud" default="true"><qti-file-href mime-type="audio/mpeg">${href}</qti-file-href></qti-card-entry></qti-card></qti-catalog>`;

/**
 * The passage: a table whose first row's category word names its catalog, its count below it.
 */
const stimulusXml = `<qti-assessment-stimulus xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="basket" title="The fruit basket" xml:lang="en">
  <qti-stimulus-body>
    <p>Kim counted the plums in her basket.</p>
    <table>
      <tbody>
        <tr><th><span data-catalog-idref="tts-plums">plums</span></th></tr>
        <tr><td>4</td></tr>
      </tbody>
    </table>
  </qti-stimulus-body>
  <qti-catalog-info>
    ${catalogOf("tts-plums", "audio/plums.mp3")}
  </qti-catalog-info>
</qti-assessment-stimulus>
`;

/**
 * The item: its stem, a table whose first row's two category words each name a catalog, and a Gap
 * Match whose sentence's two end labels each name one, its two numeral cards silent.
 */
const itemXml = `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="fruit-line" title="Fruit on a line" adaptive="false" time-dependent="false" xml:lang="en">
  <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="directedPair">
    <qti-correct-response><qti-value>n3 position-1</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-assessment-stimulus-ref identifier="basket" href="../stimuli/basket.xml"/>
  <qti-item-body>
    <p data-catalog-idref="tts-stem">Kim has 2 apples and 3 pears. Put the number of pears on the line.</p>
    <table>
      <tbody>
        <tr><th><span data-catalog-idref="tts-apples">apples</span></th><th><span data-catalog-idref="tts-pears">pears</span></th></tr>
        <tr><td>2</td><td>3</td></tr>
      </tbody>
    </table>
    <qti-gap-match-interaction response-identifier="RESPONSE" shuffle="false" max-associations="1">
      <qti-gap-text identifier="n3" match-max="1">3</qti-gap-text>
      <qti-gap-text identifier="n7" match-max="1">7</qti-gap-text>
      <p><span data-catalog-idref="tts-least">least</span> <qti-gap identifier="position-1"/> <span data-catalog-idref="tts-greatest">greatest</span></p>
    </qti-gap-match-interaction>
  </qti-item-body>
  <qti-catalog-info>
    ${catalogOf("tts-stem", "audio/stem.mp3")}
    ${catalogOf("tts-apples", "audio/apples.mp3")}
    ${catalogOf("tts-pears", "audio/pears.mp3")}
    ${catalogOf("tts-least", "audio/least.mp3")}
    ${catalogOf("tts-greatest", "audio/greatest.mp3")}
  </qti-catalog-info>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>
`;

/**
 * Each recording's package path, resolved from its document's folder (RFC 3986 §5.2), by the words
 * that name it.
 */
const recordings = {
  apples: "items/audio/apples.mp3",
  greatest: "items/audio/greatest.mp3",
  least: "items/audio/least.mp3",
  pears: "items/audio/pears.mp3",
  plums: "stimuli/audio/plums.mp3",
  stem: "items/audio/stem.mp3",
} as const;

/**
 * The address the configuration's `assets` gives a recording.
 *
 * @param recording The recording's package path.
 * @returns Its address.
 */
const addressOf = (recording: string): string => `https://media.example/${recording}`;

/**
 * The supports of a child who hears content read aloud: the `spoken` catalog support enabled at
 * `computer-read-aloud`, every other support off.
 */
const spoken: NonNullable<ItemProps["supports"]> = {
  braille: Option.none(),
  catalog: new Set(["spoken"]),
  display: { invertDisplayPolarity: false, keywordEmphasis: false, magnification: Option.none() },
  keywordTranslationLanguage: Option.none(),
  readAloud: Option.some("computer-read-aloud"),
  signLanguage: Option.none(),
};

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {
  // A server render runs no event handler.
};

/**
 * The page a host shows while the child answers: the item with its passage, both accepted from the
 * database's admitted set, every recording's address in `assets`, parsed, with its facts.
 */
const page = Effect.gen(function* rendered() {
  const item = yield* Effect.fromOption(
    acceptedItem(yield* admitted("items/fruit-line.xml", new TextEncoder().encode(itemXml))),
  );
  const stimulus = yield* Effect.fromOption(
    acceptedStimulus(yield* admitted("stimuli/basket.xml", new TextEncoder().encode(stimulusXml))),
  );
  const configuration = yield* configure({
    assets: Object.values(recordings).map(
      (recording) => [recording, addressOf(recording)] as const,
    ),
    seed: "read-aloud-names",
  });
  const props: ItemProps = {
    configuration,
    instance,
    item,
    mode: "answering",
    showFeedback: false,
    stimuli: [stimulus],
    supports: spoken,
  };
  const html = renderToStaticMarkup(
    createElement(Responses, {
      children: createElement(Item, { ...props, renderers: standardRenderers }),
      onChange: keepNothing,
      value: heldOf(startingResponses(item, props)),
    }),
  );
  const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);

  return { document, facts: factsOf(html) };
}).pipe(Effect.orDie);

/**
 * The selector of plate's read-aloud part.
 */
const readAloudPart = '[data-slot="plate-read-aloud"]';

/**
 * What one label holds after its words: its control's name, and the file its control plays.
 *
 * @param label The label.
 * @returns Its words, its children's kinds, its control's name and its control's file.
 */
const heldBy = (label: Element) => {
  const part = label.lastElementChild;

  return {
    children: [...label.children].map((child) =>
      child.matches(readAloudPart) ? "control" : child.localName,
    ),
    name: part?.querySelector("button")?.textContent ?? "",
    plays: part?.querySelector("audio > source")?.getAttribute("src") ?? "",
    words: [...label.childNodes]
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent ?? "")
      .join("")
      .trim(),
  };
};

describe("the names of read-aloud's controls across one item's page", () => {
  it.effect(
    "RN1-RN2: every control's name is its own on the page, and each label of the passage's table, the item's table and the Gap Match's sentence holds its own control after its words, named by its place among the page's labels",
    () =>
      Effect.gen(function* named() {
        const { document, facts } = yield* page;
        const names = facts.controls
          .filter(
            (control) => control.element.startsWith("button") && control.name.startsWith("Listen"),
          )
          .map((control) => control.name);

        assert.deepStrictEqual(
          {
            controls: names.length,
            parts: document.querySelectorAll(readAloudPart).length,
            shared: names.filter((name, index) => names.indexOf(name) !== index),
          },
          { controls: 6, parts: 6, shared: [] },
          `names: ${names.join(", ")}`,
        );

        const labels = ["plums", "apples", "pears", "least", "greatest"] as const;

        assert.deepStrictEqual(
          labels.map((words) =>
            heldBy(
              document.querySelector(`[data-catalog-idref="tts-${words}"]`) ??
                assert.fail(`the page writes no ${words}`),
            ),
          ),
          labels.map((words, index) => ({
            children: ["control"],
            name: `Listen to label ${String(index + 1)}`,
            plays: addressOf(recordings[words]),
            words,
          })),
        );
      }),
  );
});
