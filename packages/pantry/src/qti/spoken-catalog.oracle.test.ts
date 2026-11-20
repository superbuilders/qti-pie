/**
 * The read-aloud form's admission: the oracle judges an item and a stimulus whose read-aloud is QTI
 * 3.0.1's own, the form the AlphaTest port writes AlphaTest's narration in (implementation guide
 * §5.2.8.3, "Spoken (prerecorded or catalog pronunciation)"), and admits them with no breach, under
 * the package-media policy's laws an install stacks (`#pantry/qti/media.ts`): each part of the
 * content body that is read aloud names a catalog by `data-catalog-idref`, the item's own
 * `qti-prompt` and `qti-simple-choice`s among them, and each catalog holds one `spoken` card whose
 * entry, for the `computer-read-aloud` reading type and the default, holds the recording as a
 * `qti-file-href` to an `audio/mpeg` file of the package, named by the SHA-256 of its bytes.
 *
 * Its oracle is the specification: the information model's Catalog (§5.28, "A catalog is referenced
 * from a specific portion of the content body by a specific, unique identifier, which matches the
 * catalog's identifier"), Card (§5.26.1, one card a support; §5.26.3, "these files MUST be
 * contained in the corresponding QTI content package"), CardEntry (§5.27.2, one default; §5.27.3, a
 * `data-*` characteristic), FileHrefCard (§7.15.1, a required `mime-type`), CatalogInfo's parents
 * (§5.29, AssessmentItem and AssessmentStimulus) and SupportEnum's `spoken` (§8.38). Each refusal
 * case breaks one of them, so an admission is not the oracle admitting everything.
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { asi, breachesOf, edit, judged, manifestOf, shown } from "#pantry/test/probe.ts";
import { verdictOf } from "#pantry/test/oracle.ts";

/**
 * The recordings' package paths, each `media/` and the SHA-256 of its bytes, as the port's media
 * ETL names every file it carries into the bucket.
 */
const recordings = {
  optionA: "media/8a1f2c0d9e4b7a6c5d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c.mp3",
  optionB: "media/0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff0.mp3",
  passageContent: "media/c17a5d3e9b2f4a6c8e0d1b3a5c7e9f1b3d5a7c9e1f3b5d7a9c1e3f5b7d9a1c3e.mp3",
  passageTitle: "media/9e4c1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7.mp3",
  prompt: "media/58a84aee5484e2177c11a531daed78a8a66bac4158a84aee5484e2177c11a531.mp3",
} as const;

/**
 * A catalog of one `spoken` card holding one recording for the `computer-read-aloud` reading type,
 * the default entry, as the port writes each.
 *
 * @param id - The catalog's id.
 * @param href - The recording's package path.
 * @returns The catalog.
 */
const spokenCatalog = (id: string, href: string): string =>
  `<qti-catalog id="${id}"><qti-card support="spoken"><qti-card-entry data-reading-type="computer-read-aloud" default="true"><qti-file-href mime-type="audio/mpeg">${href}</qti-file-href></qti-card-entry></qti-card></qti-catalog>`;

/**
 * The port's read-aloud item: a Choice whose prompt and each choice name their catalog, the
 * catalogs after the body, as the XSD orders an item's children.
 */
const readAloudItem = `<qti-assessment-item xmlns="${asi}" identifier="read_aloud" title="Read aloud" adaptive="false" time-dependent="false" xml:lang="en-US">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-item-body>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-prompt data-catalog-idref="tts-prompt"><p>Which lake?</p></qti-prompt>
      <qti-simple-choice identifier="A" data-catalog-idref="tts-option-A"><p>Erie</p></qti-simple-choice>
      <qti-simple-choice identifier="B" data-catalog-idref="tts-option-B"><p>Michigan</p></qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-catalog-info>
    ${spokenCatalog("tts-prompt", recordings.prompt)}
    ${spokenCatalog("tts-option-A", recordings.optionA)}
    ${spokenCatalog("tts-option-B", recordings.optionB)}
  </qti-catalog-info>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`;

/**
 * The port's read-aloud stimulus: the passage's title and its content each name their catalog, the
 * catalogs after the stimulus body, as the XSD orders a stimulus's children.
 */
const readAloudStimulus = `<qti-assessment-stimulus xmlns="${asi}" identifier="passage" title="Passage" xml:lang="en-US">
  <qti-stimulus-body>
    <h1 data-catalog-idref="tts-passage-title">The Picnic</h1>
    <div data-catalog-idref="tts-passage-content"><p>Arleen, Tisha, and Han exchanged smiles.</p></div>
  </qti-stimulus-body>
  <qti-catalog-info>
    ${spokenCatalog("tts-passage-title", recordings.passageTitle)}
    ${spokenCatalog("tts-passage-content", recordings.passageContent)}
  </qti-catalog-info>
</qti-assessment-stimulus>`;

/**
 * A manifest of one resource that lists its document and the recordings beside it.
 *
 * @param type - The resource's type.
 * @param href - The document's path.
 * @param files - The recordings' paths.
 * @returns The manifest.
 */
const manifestFor = (type: string, href: string, files: readonly string[]): string =>
  manifestOf(
    `<resource identifier="R" type="${type}" href="${href}">${[href, ...files]
      .map((file) => `<file href="${file}"/>`)
      .join("")}</resource>`,
  );

/**
 * The bytes the oracle reads for a recording: any bytes, since no law reads a media file's content.
 */
const mp3 = "ID3";

/**
 * A package of the read-aloud item with the recordings it holds.
 *
 * @param xml - The item's text.
 * @param held - The recordings the package holds and its manifest lists.
 * @returns The package's files.
 */
const itemPackage = (
  xml: string,
  held: readonly string[] = [recordings.prompt, recordings.optionA, recordings.optionB],
) => ({
  "imsmanifest.xml": manifestFor("imsqti_item_xmlv3p0", "item.xml", held),
  "item.xml": xml,
  ...Object.fromEntries(held.map((file) => [file, mp3])),
});

describe("the read-aloud form's admission", () => {
  it.effect("admits the item whose prompt and choices are read aloud from spoken cards", () =>
    Effect.gen(function* item() {
      const judgment = yield* judged(itemPackage(readAloudItem));
      const breaches = breachesOf(judgment);

      assert.deepStrictEqual(breaches, [], shown(breaches));
      assert.deepStrictEqual(verdictOf(judgment), { verdict: "accepted" });
    }),
  );

  it.effect("admits the stimulus whose title and content are read aloud from spoken cards", () =>
    Effect.gen(function* stimulus() {
      const held = [recordings.passageTitle, recordings.passageContent];
      const judgment = yield* judged({
        "imsmanifest.xml": manifestFor("imsqti_stimulus_xmlv3p0", "stimulus.xml", held),
        "stimulus.xml": readAloudStimulus,
        ...Object.fromEntries(held.map((file) => [file, mp3])),
      });
      const breaches = breachesOf(judgment);

      assert.deepStrictEqual(breaches, [], shown(breaches));
      assert.deepStrictEqual(verdictOf(judgment), { verdict: "accepted" });
    }),
  );

  // §5.26.3: a card's files "MUST be contained in the corresponding QTI content package".
  it.effect("refuses the item when a recording is not in the package", () =>
    Effect.gen(function* missing() {
      const verdict = verdictOf(
        yield* judged(itemPackage(readAloudItem, [recordings.prompt, recordings.optionA])),
      );

      assert.strictEqual(verdict.verdict, "refused");
    }),
  );

  // §5.28: a reference "matches the catalog's identifier", and the idref resolves in the document.
  it.effect("refuses the item when a choice names a catalog the item does not hold", () =>
    Effect.gen(function* unnamed() {
      const verdict = verdictOf(
        yield* judged(
          itemPackage(
            edit(
              readAloudItem,
              'data-catalog-idref="tts-option-B"',
              'data-catalog-idref="tts-option-C"',
            ),
          ),
        ),
      );

      assert.strictEqual(verdict.verdict, "refused");
    }),
  );

  // §5.26.1: "Use only one card for any particular named support in a catalog".
  it.effect("refuses the item when a catalog holds two spoken cards", () =>
    Effect.gen(function* twice() {
      const card = `<qti-card support="spoken"><qti-card-entry data-reading-type="computer-read-aloud" default="true"><qti-file-href mime-type="audio/mpeg">${recordings.prompt}</qti-file-href></qti-card-entry></qti-card>`;
      const verdict = verdictOf(
        yield* judged(
          itemPackage(edit(readAloudItem, `${card}</qti-catalog>`, `${card}${card}</qti-catalog>`)),
        ),
      );

      assert.strictEqual(verdict.verdict, "refused");
    }),
  );

  // §7.15.1: a card's `qti-file-href` carries a `mime-type` of multiplicity [1].
  it.effect("refuses the item when a recording has no mime-type", () =>
    Effect.gen(function* untyped() {
      const verdict = verdictOf(
        yield* judged(
          itemPackage(
            edit(
              readAloudItem,
              `<qti-file-href mime-type="audio/mpeg">${recordings.optionA}`,
              `<qti-file-href>${recordings.optionA}`,
            ),
          ),
        ),
      );

      assert.strictEqual(verdict.verdict, "refused");
    }),
  );
});
