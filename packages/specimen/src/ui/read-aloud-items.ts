/**
 * The synthetic items and passage plate's read-aloud is driven through in headless Chrome
 * (`#specimen/ui/read-aloud-browser.test.ts`), each opened as content the database admitted and
 * hydrated as a host hydrates an item (`#specimen/ui/hydrated.ts`). Every said part names a catalog
 * of one `spoken` card whose entry for `computer-read-aloud` holds one WAV recording, at a path of
 * the document's own package (`audio/<part>.wav`); each rule gives every recording its address on
 * the harness's server, a tone of the length the rule asks, held back until the rule releases it,
 * or refused, so one document serves every rule. Nothing in them is anyone's item: the words are
 * the suite's own.
 *
 * @module
 */

/**
 * A synthetic document: its location in its package, its XML, and the package path of each
 * recording its cards name, by the part it reads.
 */
export interface Synthetic {
  readonly location: string;
  readonly recordings: Readonly<Record<string, string>>;
  readonly xml: string;
}

/**
 * A catalog of one `spoken` card whose default entry, for `computer-read-aloud`, holds one WAV
 * recording.
 *
 * @param id The catalog's `id`.
 * @param href The recording's path, from its document's folder.
 * @returns The catalog's XML.
 */
const catalogOf = (id: string, href: string): string =>
  `<qti-catalog id="${id}"><qti-card support="spoken"><qti-card-entry data-reading-type="computer-read-aloud" default="true"><qti-file-href mime-type="audio/wav">${href}</qti-file-href></qti-card-entry></qti-card></qti-catalog>`;

/**
 * The catalogs of a document's said parts, each `tts-<part>` holding `audio/<part>.wav`.
 *
 * @param parts The parts.
 * @returns The `qti-catalog-info`'s XML.
 */
const catalogsOf = (parts: readonly string[]): string =>
  `<qti-catalog-info>${parts.map((part) => catalogOf(`tts-${part}`, `audio/${part}.wav`)).join("")}</qti-catalog-info>`;

/**
 * The package path of each part's recording, from a document's folder.
 *
 * @param folder The document's folder in its package.
 * @param parts The parts.
 * @returns Each recording's package path, by its part.
 */
const recordingsOf = (folder: string, parts: readonly string[]): Readonly<Record<string, string>> =>
  Object.fromEntries(parts.map((part) => [part, `${folder}/audio/${part}.wav`]));

/**
 * The opening of an item, every declaration its interactions need given.
 *
 * @param identifier The item's identifier.
 * @param title Its title.
 * @param declarations Its response declarations.
 * @returns The XML up to its body.
 */
const itemHead = (identifier: string, title: string, declarations: string): string =>
  `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="${identifier}" title="${title}" adaptive="false" time-dependent="false" xml:lang="en">
  ${declarations}
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>`;

/**
 * The close of an item: its catalogs and its response processing.
 *
 * @param parts Its said parts.
 * @returns The XML after its body.
 */
const itemTail = (parts: readonly string[]): string => `
  ${catalogsOf(parts)}
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>
`;

/**
 * The said parts of {@link said}.
 */
const saidParts = ["stem", "prompt", "apple", "pear"] as const;

/**
 * A Choice item every part of which is said: its stem, a block of the body before the interaction
 * ("Listen to text 1"), its prompt ("Listen to question 1") and its two choices ("Listen to choice
 * 1" and "2").
 */
export const said: Synthetic = {
  location: "items/said.xml",
  recordings: recordingsOf("items", saidParts),
  xml: `${itemHead(
    "said",
    "Red fruit",
    `<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"><qti-correct-response><qti-value>A</qti-value></qti-correct-response></qti-response-declaration>`,
  )}
  <qti-item-body>
    <div data-catalog-idref="tts-stem"><p>Kim picked a red fruit from the tree.</p></div>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-prompt data-catalog-idref="tts-prompt"><p>Which fruit did Kim pick?</p></qti-prompt>
      <qti-simple-choice identifier="A" data-catalog-idref="tts-apple"><p>an apple</p></qti-simple-choice>
      <qti-simple-choice identifier="B" data-catalog-idref="tts-pear"><p>a pear</p></qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>${itemTail(saidParts)}`,
};

/**
 * The said parts of {@link line}.
 */
const lineParts = ["stem", "least", "greatest"] as const;

/**
 * A Gap Match in the number line form: its stem ("Listen to text 1"), and a sentence whose two end
 * labels each hold their control after their words ("Listen to label 1" and "2"), with one gap
 * between them and two numeral cards, silent.
 */
export const line: Synthetic = {
  location: "items/line.xml",
  recordings: recordingsOf("items", lineParts),
  xml: `${itemHead(
    "line",
    "Numbers on a line",
    `<qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="directedPair"><qti-correct-response><qti-value>n3 middle</qti-value></qti-correct-response></qti-response-declaration>`,
  )}
  <qti-item-body>
    <p data-catalog-idref="tts-stem">Put the number between the two ends of the line.</p>
    <qti-gap-match-interaction response-identifier="RESPONSE" shuffle="false" max-associations="1">
      <qti-gap-text identifier="n3" match-max="1">3</qti-gap-text>
      <qti-gap-text identifier="n7" match-max="1">7</qti-gap-text>
      <p><span data-catalog-idref="tts-least">least</span> <qti-gap identifier="middle"/> <span data-catalog-idref="tts-greatest">greatest</span></p>
    </qti-gap-match-interaction>
  </qti-item-body>${itemTail(lineParts)}`,
};

/**
 * The said parts of {@link media}.
 */
const mediaParts = ["stem"] as const;

/**
 * Write a Media interaction over a WAV recording of its document's package.
 *
 * @param response Its response's identifier.
 * @param file The recording's path, from the document's folder.
 * @param settings Its `max-plays` and whether it loops.
 * @param settings.loop Whether it loops.
 * @param settings.maxPlays Its `max-plays`, none for no limit.
 * @returns Its XML.
 */
const mediaOf = (
  response: string,
  file: string,
  settings: { readonly loop: boolean; readonly maxPlays: number | undefined },
): string =>
  `<qti-media-interaction response-identifier="${response}" autostart="false"${settings.loop ? ` loop="true"` : ""}${settings.maxPlays === undefined ? "" : ` max-plays="${String(settings.maxPlays)}"`}><audio><source src="${file}" type="audio/wav"/></audio></qti-media-interaction>`;

/**
 * An item of three Media interactions, after a said stem ("Listen to text 1"): M1 under `max-plays`
 * 1, M2 looping with no limit, and M3 under `max-plays` 1, each over its own recording
 * (`audio/m1.wav` to `audio/m3.wav`).
 */
export const media: Synthetic = {
  location: "items/media.xml",
  recordings: {
    ...recordingsOf("items", mediaParts),
    m1: "items/audio/m1.wav",
    m2: "items/audio/m2.wav",
    m3: "items/audio/m3.wav",
  },
  xml: `${itemHead(
    "media",
    "Three recordings",
    ["M1", "M2", "M3"]
      .map(
        (identifier) =>
          `<qti-response-declaration identifier="${identifier}" cardinality="single" base-type="integer"/>`,
      )
      .join(""),
  )}
  <qti-item-body>
    <p data-catalog-idref="tts-stem">Listen to each recording.</p>
    ${mediaOf("M1", "audio/m1.wav", { loop: false, maxPlays: 1 })}
    ${mediaOf("M2", "audio/m2.wav", { loop: true, maxPlays: undefined })}
    ${mediaOf("M3", "audio/m3.wav", { loop: false, maxPlays: 1 })}
  </qti-item-body>
  <qti-catalog-info>${catalogOf("tts-stem", "audio/stem.wav")}</qti-catalog-info>
</qti-assessment-item>
`,
};

/**
 * The said parts of {@link passage}.
 */
const passageParts = ["passage", "plums"] as const;

/**
 * A passage whose paragraph is said ("Listen to text 1") and whose table's category word holds its
 * control after its word ("Listen to label 1").
 */
export const passage: Synthetic = {
  location: "stimuli/basket.xml",
  recordings: recordingsOf("stimuli", passageParts),
  xml: `<qti-assessment-stimulus xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="basket" title="The fruit basket" xml:lang="en">
  <qti-stimulus-body>
    <p data-catalog-idref="tts-passage">Kim counted the fruit in her basket.</p>
    <table>
      <tbody>
        <tr><th><span data-catalog-idref="tts-plums">plums</span></th></tr>
        <tr><td>4</td></tr>
      </tbody>
    </table>
  </qti-stimulus-body>
  ${catalogsOf(passageParts)}
</qti-assessment-stimulus>
`,
};

/**
 * The said parts of {@link graph}.
 */
const graphParts = [
  "stem",
  "title",
  "apples",
  "pears",
  "first-question",
  "first-a",
  "first-b",
  "second-question",
  "second-a",
  "second-b",
  "third-question",
  "third-a",
  "third-b",
] as const;

/**
 * Write a Choice interaction whose question and two choices are said: its question by the catalog
 * its root references, read before the interaction, or by its prompt's, read after the prompt.
 *
 * @param response Its response's identifier.
 * @param prefix The prefix of its parts' catalogs.
 * @param question Where its question's catalog is referenced: its root, or its prompt.
 * @param words Its prompt's words, then its choices'.
 * @returns Its XML.
 */
const choiceOf = (
  response: string,
  prefix: string,
  question: "prompt" | "root",
  words: readonly [string, string, string],
) =>
  `<qti-choice-interaction response-identifier="${response}" max-choices="1"${question === "root" ? ` data-catalog-idref="tts-${prefix}-question"` : ""}>
      <qti-prompt${question === "prompt" ? ` data-catalog-idref="tts-${prefix}-question"` : ""}><p>${words[0]}</p></qti-prompt>
      <qti-simple-choice identifier="${response}A" data-catalog-idref="tts-${prefix}-a"><p>${words[1]}</p></qti-simple-choice>
      <qti-simple-choice identifier="${response}B" data-catalog-idref="tts-${prefix}-b"><p>${words[2]}</p></qti-simple-choice>
    </qti-choice-interaction>`;

/**
 * A picture graph's item with its passage, each part said, named in the order the page shows them:
 * two said blocks of its body, the stem ("Listen to text 1") and the graph's title ("Listen to text
 * 2"); a table whose first row's two category words each hold their control after their word
 * ("Listen to label 1" and "2"); three Choice interactions, each with a said question, the first's
 * by the catalog its root references, read before it ("Listen to question 1"), the second's and the
 * third's by their prompts' ("Listen to question 2" and "3"), and two said choices each ("Listen to
 * choice 1" to "6"); and, last, the passage the body places in its closing block, its paragraph
 * ("Listen to text 3") and its category ("Listen to label 3"). So the page names its questions and
 * its labels in the order it shows them, each once, only where it makes their controls in that
 * order and each once: a first interaction's question on its root and a second's on its prompt, a
 * third's on its prompt after the second's, and a passage's label after the item's. It is never
 * scored, so it names no response processing, whose published templates read a `RESPONSE`.
 */
export const graph: Synthetic = {
  location: "items/graph.xml",
  recordings: recordingsOf("items", graphParts),
  xml: `${itemHead(
    "graph",
    "Fruit in a graph",
    ["FIRST", "SECOND", "THIRD"]
      .map(
        (identifier) =>
          `<qti-response-declaration identifier="${identifier}" cardinality="single" base-type="identifier"><qti-correct-response><qti-value>${identifier}A</qti-value></qti-correct-response></qti-response-declaration>`,
      )
      .join(""),
  )}
  <qti-assessment-stimulus-ref identifier="basket" href="../stimuli/basket.xml"/>
  <qti-item-body>
    <p data-catalog-idref="tts-stem">Kim has 2 apples and 3 pears.</p>
    <p data-catalog-idref="tts-title">Fruit in Kim's basket</p>
    <table>
      <tbody>
        <tr><th><span data-catalog-idref="tts-apples">apples</span></th><th><span data-catalog-idref="tts-pears">pears</span></th></tr>
        <tr><td>2</td><td>3</td></tr>
      </tbody>
    </table>
    ${choiceOf("FIRST", "first", "root", ["Which fruit does Kim have more of?", "pears", "apples"])}
    ${choiceOf("SECOND", "second", "prompt", ["How many apples does Kim have?", "2", "3"])}
    ${choiceOf("THIRD", "third", "prompt", ["Which fruit grows on vines?", "neither", "both"])}
    <div data-stimulus-idref="basket"></div>
  </qti-item-body>
  ${catalogsOf(graphParts)}
</qti-assessment-item>
`,
};
