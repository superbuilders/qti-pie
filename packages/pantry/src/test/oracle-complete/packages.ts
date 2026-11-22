/**
 * The mutations of the law oracle's package laws (§1.6) and the overlay laws it stated before lane
 * OL (§1.7), each drawn to break exactly its law in an accepted package
 * (`src/test/complete.oracle.test.ts`).
 *
 * Each edits the every-relation package: its manifest, its usage data, its first item's body,
 * declarations and processing, or its section document. A site is drawn where the base holds
 * several, and a value among several the law refuses. An edit renames nothing another reference
 * names, so no law ahead of its own breaks first.
 */
import { element, int } from "@bjornpagen/testing/gen";
import { parsedDecimalBytes } from "#pantry/qti/limits.ts";
import {
  passageAt,
  replaceDrawn,
  replaceOnce,
  replacing,
  textOf,
  withText,
} from "#pantry/test/oracle-complete/mutation.ts";
import type { Mutation } from "#pantry/test/oracle-complete/mutation.ts";

/**
 * The every-relation item.
 */
const item = "items/item.xml";

/**
 * The every-relation manifest.
 */
const manifest = "imsmanifest.xml";

/**
 * The usage data's resource, which nothing else names, so its type and identifier may change
 * alone.
 */
const usageResource = '<resource identifier="usage-res" type="qtiusagedata/xml" href="usage.xml">';

/**
 * The opening tag of a `qti-card` of the given `support`, as written.
 *
 * @param support - The support's lexical form.
 * @returns The tag.
 */
const card = (support: string): string => `<qti-card support="${support}">`;

/**
 * The item's slider interaction.
 */
const slider =
  '<qti-slider-interaction response-identifier="LEVER" lower-bound="0" upper-bound="10" step="1"/>';

/**
 * Each law's mutation, by law.
 */
export const packageMutations = {
  // AL3 required (the XSDs' use="required"): a declaration of the item written with no
  // cardinality, refused under required-attribute alone (an absent attribute is no empty one).
  "AL3 required": passageAt(
    "AL3 required",
    item,
    '<qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier"/>',
    [
      '<qti-outcome-declaration identifier="FEEDBACK" base-type="identifier"/>',
      '<qti-outcome-declaration base-type="identifier" identifier="FEEDBACK"/>',
    ],
  ),
  // AreaMapping base type (O5): an area mapping on the integer response LEVER, which no point is.
  "AreaMapping base type": passageAt(
    "AreaMapping base type",
    item,
    '<qti-mapping default-value="0"><qti-map-entry map-key="3" mapped-value="1"/></qti-mapping>',
    [
      '<qti-mapping default-value="0"><qti-map-entry map-key="3" mapped-value="1"/></qti-mapping><qti-area-mapping default-value="0"><qti-area-map-entry shape="rect" coords="0,0,10,10" mapped-value="1"/></qti-area-mapping>',
    ],
  ),
  // Aria value range (reading 9's ARIA bounds): the division's aria-valuemin above its
  // aria-valuemax.
  "Aria value range": passageAt("Aria value range", item, 'aria-valuemin="0" aria-valuemax="10"', [
    'aria-valuemin="11" aria-valuemax="10"',
    'aria-valuemin="0" aria-valuemax="-1"',
  ]),
  // Arity (P2): the match given one operand.
  Arity: passageAt("Arity", item, '\n          <qti-correct identifier="RESPONSE"/>', [""]),
  // Binding cardinality (reading 92): the choice interaction that binds the single RESPONSE told
  // to take more than one choice.
  "Binding cardinality": passageAt("Binding cardinality", item, 'max-choices="1" min-choices="0"', [
    'max-choices="2" min-choices="0"',
    'max-choices="0" min-choices="0"',
  ]),
  // Binding declared (O3): the slider bound to an outcome, or a template, of its type.
  "Binding declared": passageAt("Binding declared", item, slider, [
    slider.replace("LEVER", "COUNT"),
    slider.replace("LEVER", "N"),
  ]),
  // Binding unique (reading 92): a second interaction bound to a bound response.
  "Binding unique": passageAt(
    "Binding unique",
    item,
    '<qti-hottext-interaction response-identifier="HOT"',
    [
      '<qti-hottext-interaction response-identifier="RESPONSE"',
      '<qti-hottext-interaction response-identifier="AREA"',
    ],
  ),
  // BindingFit (O3): the slider bound to a response of a type it does not take.
  BindingFit: passageAt(
    "BindingFit",
    item,
    '<qti-response-declaration identifier="LEVER" cardinality="single" base-type="integer">',
    [
      '<qti-response-declaration identifier="LEVER" cardinality="single" base-type="string">',
      '<qti-response-declaration identifier="LEVER" cardinality="single" base-type="boolean">',
    ],
  ),
  // Card support (reading R9-a): the two cards of the item's catalog given one support, compared by
  // its value, the form as written (no union member of `support` has whitespace its class
  // changes): a listed support, an `ext:` name, a listed support padded on both cards, or a form
  // outside the domain on both. Each of the last two is AL1's too, whose rule ranks behind
  // card-support, so the database names the twin by card-support.
  "Card support": {
    law: "Card support",
    mutate:
      ({ entries }) =>
      (source) => {
        const support = source.draw(
          element([
            "keyword-translation",
            "ext:sign-language-avatar",
            " keyword-translation ",
            "keyword translation",
          ]),
        );

        const first = replaceOnce(
          textOf(entries, item),
          card("keyword-translation"),
          card(support),
        );

        return withText(entries, item, replaceOnce(first, card("sign-language"), card(support)));
      },
    over: "package",
  },
  // Choice bounds (readings 18 and 76): the choice interaction's least above its most.
  "Choice bounds": passageAt("Choice bounds", item, 'max-choices="1" min-choices="0"', [
    'max-choices="1" min-choices="2"',
  ]),
  // Choice identifier key (reading 104): two simple choices of one identifier.
  "Choice identifier key": passageAt(
    "Choice identifier key",
    item,
    '<qti-simple-choice identifier="ChoiceB">',
    ['<qti-simple-choice identifier="ChoiceA">'],
  ),
  // Choice not variable (reading 104): a hottext named as a variable its item declares.
  "Choice not variable": passageAt("Choice not variable", item, '<qti-hottext identifier="H1">', [
    '<qti-hottext identifier="COUNT">',
    '<qti-hottext identifier="SHOWN">',
  ]),
  // Context variable reference (§2.2.2.1): the portable interaction's context variable naming an
  // ID of the item that is no context declaration.
  "Context variable reference": passageAt(
    "Context variable reference",
    item,
    '<qti-context-variable identifier="CTX"/>',
    ['<qti-context-variable identifier="lead"/>', '<qti-context-variable identifier="caption"/>'],
  ),
  // Document entry (P3): the usage data's entry missing, which its resource lists.
  "Document entry": {
    law: "Document entry",
    mutate:
      ({ entries }) =>
      () =>
        new Map([...entries].filter(([path]) => path !== "usage.xml")),
    over: "package",
  },
  // Document lang (R26): the item's xml:lang no language its record lists.
  "Document lang": passageAt("Document lang", item, 'xml:lang="en" tool-name', [
    'xml:lang="fr" tool-name',
    'xml:lang="de" tool-name',
  ]),
  // DocumentId key (reading 101): a second element of the item given an id the item holds.
  "DocumentId key": passageAt("DocumentId key", item, '<span id="caption">', [
    '<span id="lead">',
    '<span id="row-head">',
  ]),
  // Double bound (reading 144): a slider's step below zero, plainly or by the least subnormal,
  // each in xs:double's lexical space but outside NonNegativeDoubleDType's bound, judged on its IEEE
  // value.
  "Double bound": passageAt("Double bound", item, 'upper-bound="10" step="1"', [
    'upper-bound="10" step="-1"',
    'upper-bound="10" step="-4.9e-324"',
  ]),
  // Equal tolerance (reading 121): an absolute or relative equality written with no tolerance,
  // or with a tolerance that is not above 0.
  "Equal tolerance": passageAt(
    "Equal tolerance",
    item,
    '<qti-match>\n          <qti-variable identifier="RESPONSE"/>\n          <qti-correct identifier="RESPONSE"/>\n        </qti-match>',
    [
      '<qti-equal tolerance-mode="absolute"><qti-variable identifier="SCORE"/><qti-base-value base-type="float">1.5</qti-base-value></qti-equal>',
      '<qti-equal tolerance-mode="relative" tolerance="0"><qti-variable identifier="SCORE"/><qti-base-value base-type="float">1.5</qti-base-value></qti-equal>',
      '<qti-equal tolerance-mode="absolute" tolerance="-1 2"><qti-variable identifier="SCORE"/><qti-base-value base-type="float">1.5</qti-base-value></qti-equal>',
    ],
  ),
  // Feedback outcome type: the feedback inline naming an outcome that is no identifier.
  "Feedback outcome type": passageAt(
    "Feedback outcome type",
    item,
    '<qti-feedback-inline outcome-identifier="FEEDBACK"',
    [
      '<qti-feedback-inline outcome-identifier="COUNT"',
      '<qti-feedback-inline outcome-identifier="SCORE"',
    ],
  ),
  // Feedback reference: the feedback inline naming nothing the item declares.
  "Feedback reference": passageAt(
    "Feedback reference",
    item,
    '<qti-feedback-inline outcome-identifier="FEEDBACK"',
    ['<qti-feedback-inline outcome-identifier="ABSENT"'],
  ),
  // File exists (P3, reading 102): a resource's file naming a path no entry is.
  "File exists": passageAt("File exists", manifest, '<file href="usage.xml"/>', [
    '<file href="usage.xml"/><file href="missing.xml"/>',
    '<file href="usage.xml"/><file href="media/none.png"/>',
  ]),
  // File listed (P3): an entry no resource's file lists.
  "File listed": {
    law: "File listed",
    mutate:
      ({ entries }) =>
      (source) =>
        withText(
          entries,
          source.draw(element(["notes.txt", "items/extra.xml", "bulk/x.bin"])),
          "x",
        ),
    over: "package",
  },
  // Href listed (P3, reading 102): a new resource whose href names an entry its own files do not
  // list.
  "Href listed": passageAt("Href listed", manifest, "  </resources>", [
    '    <resource identifier="extra-res" type="webcontent" href="items/media/pic.png"><file href="usage.xml"/></resource>\n  </resources>',
  ]),
  // Idref target (reading 14): the division's aria-labelledby naming no id of the item.
  "Idref target": passageAt("Idref target", item, 'aria-labelledby="caption"', [
    'aria-labelledby="nothing"',
    'aria-labelledby="caption absent"',
  ]),
  // Include fragment identifier, Include target and Include root (readings 85, 114 and 117): the
  // second item's include naming its fragment by a fragment identifier; naming no document, by an
  // entry the manifest lists as none or no href (one naming a file the package does not hold is
  // "File exists"'s alone, and one naming a file outside the package is stored as written and never
  // fetched, reading 115); or naming the rule fragment, whose root no item body holds.
  "Include fragment identifier": passageAt(
    "Include fragment identifier",
    "items/item2.xml",
    '<xi:include href="fragment.xml"/>',
    ['<xi:include href="fragment.xml#part"/>'],
  ),
  // Include parse (XInclude 1.0 §3.1, reading 85): beside the second item's include of its
  // fragment, an include of the package's picture written with an xpointer and parse="text", which
  // XInclude makes a fatal error ("The xpointer attribute must not be present when
  // parse="text""); either alone is admitted and includes nothing.
  "Include parse": passageAt(
    "Include parse",
    "items/item2.xml",
    '<xi:include href="fragment.xml"/>',
    [
      '<xi:include href="fragment.xml"/><xi:include href="media/pic.png" parse="text" xpointer="p"/>',
    ],
  ),
  "Include root": passageAt(
    "Include root",
    "items/item2.xml",
    '<xi:include href="fragment.xml"/>',
    ['<xi:include href="fragment.xml"/><xi:include href="rules.xml"/>'],
  ),
  "Include target": passageAt(
    "Include target",
    "items/item2.xml",
    '<xi:include href="fragment.xml"/>',
    [
      '<xi:include href="fragment.xml"/><xi:include href="media/pic.png"/>',
      '<xi:include href="fragment.xml"/><xi:include/>',
    ],
  ),
  // Inclusion cycle (reading 85): the item's included fragment including itself.
  "Inclusion cycle": passageAt("Inclusion cycle", "items/fragment.xml", '  <p id="fragment-note"', [
    '  <xi:include xmlns:xi="http://www.w3.org/2001/XInclude" href="fragment.xml"/>\n  <p id="fragment-note"',
  ]),
  // Key text bound (the stated limit, reading 133): the item's division's aria-valuemin, an
  // `xs:decimal` of zeros past `parsedDecimalBytes`, the most `Text.parseDecimal` reads
  // (`AriaBounds.min`), each digit one byte, its value 0, so its range holds and the bound alone
  // refuses it. A foreign element's names are bounded at half and a text a query matches at all of
  // `matchedTextBytes`, a quarter of a gigabyte, which no drawn package reaches; a path, a prefix,
  // an open attribute's names, an IDREF's token, an ID and an identifier a key holds are each held
  // to its key text type's bound (`#pantry/qti/limits.ts`), and an href as written to none.
  "Key text bound": {
    law: "Key text bound",
    mutate:
      ({ entries }) =>
      (source) =>
        withText(
          entries,
          item,
          replaceOnce(
            textOf(entries, item),
            'aria-valuemin="0" aria-valuemax="10"',
            `aria-valuemin="${"0".repeat(parsedDecimalBytes + 1 + source.draw(int(0, 40)))}" aria-valuemax="10"`,
          ),
        ),
    over: "package",
  },
  // LOM learning resource type (reading 122): a record of the LOM vocabulary typing its object
  // as an exam or a self assessment.
  "LOM learning resource type": {
    law: "LOM learning resource type",
    mutate:
      ({ entries }) =>
      (source) => {
        const value = source.draw(element(["exam", "self assessment"]));

        return withText(
          entries,
          manifest,
          source.draw(
            replaceDrawn(
              textOf(entries, manifest),
              /\n {10}<\/imsmd:general>\n {8}<\/imsmd:lom>/u,
              () =>
                `\n          </imsmd:general>\n          <imsmd:educational><imsmd:learningResourceType><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>${value}</imsmd:value></imsmd:learningResourceType></imsmd:educational>\n        </imsmd:lom>`,
            ),
          ),
        );
      },
    over: "package",
  },
  // Label tools (§5.16.5): the item, whose division has a label, writing no tool-version.
  "Label tools": passageAt("Label tools", item, ' tool-version="1"', [""]),
  // LomObjectIdentifier (QTI 3.0 Metadata §2.7.1.1): a record naming another identifier.
  LomObjectIdentifier: passageAt(
    "LomObjectIdentifier",
    manifest,
    "<imsmd:entry>item1</imsmd:entry>",
    ["<imsmd:entry>item9</imsmd:entry>", "<imsmd:entry>Item1</imsmd:entry>"],
  ),
  // Lookup table cardinality (O5): the outcome LEVEL, which holds a match table, made a
  // container.
  "Lookup table cardinality": passageAt(
    "Lookup table cardinality",
    item,
    '<qti-outcome-declaration identifier="LEVEL" cardinality="single" base-type="string">',
    [
      '<qti-outcome-declaration identifier="LEVEL" cardinality="multiple" base-type="string">',
      '<qti-outcome-declaration identifier="LEVEL" cardinality="ordered" base-type="string">',
    ],
  ),
  // MappableBaseType (O5): the float response REAL, which holds a mapping, made a file.
  MappableBaseType: passageAt(
    "MappableBaseType",
    item,
    '<qti-response-declaration identifier="REAL" cardinality="single" base-type="float">',
    ['<qti-response-declaration identifier="REAL" cardinality="single" base-type="file">'],
  ),
  // MathML arity (MathML 3 §4.2.3): a divide applied to one operand, or to three.
  "MathML arity": passageAt(
    "MathML arity",
    item,
    "    <p>It says <q>read this</q> and stops.</p>",
    [
      '    <p><math xmlns="http://www.w3.org/1998/Math/MathML"><apply><divide/><cn>1</cn></apply></math></p>\n    <p>It says <q>read this</q> and stops.</p>',
      '    <p><math xmlns="http://www.w3.org/1998/Math/MathML"><apply><divide/><cn>1</cn><cn>2</cn><cn>3</cn></apply></math></p>\n    <p>It says <q>read this</q> and stops.</p>',
    ],
  ),
  // Media source src (reading 124): a video's source that names no resource.
  "Media source src": passageAt(
    "Media source src",
    item,
    "    <p>It says <q>read this</q> and stops.</p>",
    [
      '    <video><source type="video/mp4"/></video>\n    <p>It says <q>read this</q> and stops.</p>',
      '    <audio><source type="audio/ogg"/></audio>\n    <p>It says <q>read this</q> and stops.</p>',
    ],
  ),
  // N5 Follow (the content model's Follow): a second correct response of RESPONSE, or the
  // FEEDBACK outcome declared after the item body.
  "N5 Follow": {
    law: "N5 Follow",
    mutate: replacing([
      {
        passage: "<qti-correct-response><qti-value>ChoiceA</qti-value></qti-correct-response>",
        path: item,
        replacements: [
          "<qti-correct-response><qti-value>ChoiceA</qti-value></qti-correct-response><qti-correct-response><qti-value>ChoiceB</qti-value></qti-correct-response>",
        ],
      },
      {
        passage: "  <qti-response-processing>",
        path: "items/item3.xml",
        replacements: [
          '  <qti-outcome-declaration identifier="LATE" cardinality="single" base-type="float"/>\n  <qti-response-processing>',
        ],
      },
    ]),
    over: "package",
  },
  // N6 ancestry (the ancestry bans): a text entry, bound to a new string response, inside the
  // hottext interaction's paragraph.
  "N6 ancestry": {
    law: "N6 ancestry",
    mutate:
      ({ entries }) =>
      (source) => {
        const declared = replaceOnce(
          textOf(entries, item),
          '<qti-response-declaration identifier="WIDGET" cardinality="single" base-type="string"/>',
          '<qti-response-declaration identifier="WIDGET" cardinality="single" base-type="string"/><qti-response-declaration identifier="TYPED" cardinality="single" base-type="string"/>',
        );
        const placed = source.draw(element(["before", "after"]));

        return withText(
          entries,
          item,
          declared.replace(
            /(?<open><qti-hottext-interaction response-identifier="HOT" max-choices="1">\n {6}<p>)(?<rest>Pick [^\n]*<\/p>)/u,
            (_, open: string, rest: string) =>
              placed === "before"
                ? `${open}<qti-text-entry-interaction response-identifier="TYPED"/> ${rest}`
                : `${open}${rest.replace("</p>", ' <qti-text-entry-interaction response-identifier="TYPED"/></p>')}`,
          ),
        );
      },
    over: "package",
  },
  // N7 Counted (the content model's counted positions): a match interaction, bound to a new
  // directed pair response, with one match set where it takes two.
  "N7 Counted": {
    law: "N7 Counted",
    mutate:
      ({ entries }) =>
      (source) => {
        const choices = source.draw(int(1, 2));
        const set = Array.from(
          { length: choices },
          (_, place) =>
            `<qti-simple-associable-choice identifier="M${String(place + 1)}" match-max="1">M</qti-simple-associable-choice>`,
        ).join("");

        return withText(
          entries,
          item,
          replaceOnce(
            replaceOnce(
              textOf(entries, item),
              '<qti-response-declaration identifier="WIDGET" cardinality="single" base-type="string"/>',
              '<qti-response-declaration identifier="WIDGET" cardinality="single" base-type="string"/><qti-response-declaration identifier="PAIRED" cardinality="multiple" base-type="directedPair"/>',
            ),
            "    <p>It says <q>read this</q> and stops.</p>",
            `    <qti-match-interaction response-identifier="PAIRED" max-associations="1"><qti-simple-match-set>${set}</qti-simple-match-set></qti-match-interaction>\n    <p>It says <q>read this</q> and stops.</p>`,
          ),
        );
      },
    over: "package",
  },
  // N7 barred by (the children an attribute bars): a column group with a span and a column.
  "N7 barred by": passageAt(
    "N7 barred by",
    item,
    "    <p>It says <q>read this</q> and stops.</p>",
    [
      '    <table><colgroup span="2"><col/></colgroup><tbody><tr><td>x</td></tr></tbody></table>\n    <p>It says <q>read this</q> and stops.</p>',
      '    <table><colgroup span="3"><col/><col/></colgroup><tbody><tr><td>x</td></tr></tbody></table>\n    <p>It says <q>read this</q> and stops.</p>',
    ],
  ),
  // Pattern language (§5.162.5, §5.48.4; reading 58): the fragment's text entry given a pattern-mask
  // that is no Appendix F regular expression: a flag group, an unclosed class, a lone `{`.
  "Pattern language": passageAt(
    "Pattern language",
    "items/fragment.xml",
    '<qti-text-entry-interaction response-identifier="TEXT"/>',
    [
      '<qti-text-entry-interaction response-identifier="TEXT" pattern-mask="(?i)yes"/>',
      '<qti-text-entry-interaction response-identifier="TEXT" pattern-mask="[a-z"/>',
      '<qti-text-entry-interaction response-identifier="TEXT" pattern-mask="a{"/>',
    ],
  ),
  // Picture source srcset (reading 124): a picture's source that names no image candidates.
  "Picture source srcset": passageAt(
    "Picture source srcset",
    item,
    "    <p>It says <q>read this</q> and stops.</p>",
    [
      '    <p><picture><source type="image/png"/><img src="media/pic.png" alt="a"/></picture></p>\n    <p>It says <q>read this</q> and stops.</p>',
    ],
  ),
  // Printed variable reference: the printed variable naming nothing the item declares.
  "Printed variable reference": passageAt(
    "Printed variable reference",
    item,
    '<qti-printed-variable identifier="N" base="DIGITS"/>',
    [
      '<qti-printed-variable identifier="ABSENT" base="DIGITS"/>',
      '<qti-printed-variable identifier="N" base="ABSENT"/>',
    ],
  ),
  // Quotation punctuation (reading 127): a q holding a quotation mark of its own.
  "Quotation punctuation": passageAt("Quotation punctuation", item, "<q>read this</q>", [
    '<q>"read this"</q>',
    "<q>“read this”</q>",
  ]),
  // RecordBindingFit (O3): the slider bound to a new record response, which it does not bind.
  RecordBindingFit: {
    law: "RecordBindingFit",
    mutate:
      ({ entries }) =>
      () =>
        withText(
          entries,
          item,
          replaceOnce(
            replaceOnce(
              textOf(entries, item),
              '<qti-response-declaration identifier="WIDGET" cardinality="single" base-type="string"/>',
              '<qti-response-declaration identifier="WIDGET" cardinality="single" base-type="string"/><qti-response-declaration identifier="REC" cardinality="record"/>',
            ),
            slider,
            slider.replace("LEVER", "REC"),
          ),
        ),
    over: "package",
  },
  // RootOfType (P2): the usage data listed as an item, a test or a stimulus.
  RootOfType: passageAt("RootOfType", manifest, usageResource, [
    usageResource.replace("qtiusagedata/xml", "imsqti_item_xmlv3p0"),
    usageResource.replace("qtiusagedata/xml", "imsqti_stimulus_xmlv3p0"),
  ]),
  // Rounding figures (reading 119): a round-to of no significant figures, or of fewer than no
  // decimal places.
  "Rounding figures": passageAt(
    "Rounding figures",
    item,
    '<qti-round><qti-variable identifier="SCORE"/></qti-round>',
    [
      '<qti-round-to rounding-mode="significantFigures" figures="0"><qti-variable identifier="SCORE"/></qti-round-to>',
      '<qti-round-to rounding-mode="decimalPlaces" figures="-1"><qti-variable identifier="SCORE"/></qti-round-to>',
    ],
  ),
  // Self dependency (CP 1.2): a resource depending on itself.
  "Self dependency": passageAt(
    "Self dependency",
    manifest,
    '      <dependency identifierref="stimulus1-res"/>',
    [
      '      <dependency identifierref="stimulus1-res"/>\n      <dependency identifierref="item1-res"/>',
    ],
  ),
  // Slider bounds (§5.150): the slider's lower bound above its upper.
  "Slider bounds": passageAt("Slider bounds", item, slider, [
    slider.replace('lower-bound="0"', 'lower-bound="11"'),
    slider.replace('upper-bound="10"', 'upper-bound="-1"'),
  ]),
  // Stimulus ref target (the UP audit's B5): the stimulus ref naming a document that is no
  // stimulus.
  "Stimulus ref target": passageAt(
    "Stimulus ref target",
    item,
    '<qti-assessment-stimulus-ref identifier="stimulus1" href="stimulus.xml"/>',
    [
      '<qti-assessment-stimulus-ref identifier="stimulus1" href="item2.xml"/>',
      '<qti-assessment-stimulus-ref identifier="stimulus1" href="item3.xml"/>',
    ],
  ),
  // Table headers (reading 126): a cell's headers naming an id of the item that is no header of
  // its table.
  "Table headers": passageAt("Table headers", item, '<td headers="row-head">', [
    '<td headers="caption">',
    '<td headers="lead">',
  ]),
  // Template reference: the template inline naming nothing the item declares.
  "Template reference": passageAt(
    "Template reference",
    item,
    '<qti-template-inline template-identifier="SHOWN"',
    ['<qti-template-inline template-identifier="ABSENT"'],
  ),
  // Template variable type: the template inline naming the item's single integer template.
  "Template variable type": passageAt(
    "Template variable type",
    item,
    '<qti-template-inline template-identifier="SHOWN"',
    ['<qti-template-inline template-identifier="N"'],
  ),
  // Track srclang (reading 125): a subtitles track that names no language.
  "Track srclang": passageAt(
    "Track srclang",
    item,
    "    <p>It says <q>read this</q> and stops.</p>",
    [
      '    <video src="media/pic.png"><track src="media/pic.png"/></video>\n    <p>It says <q>read this</q> and stops.</p>',
      '    <video src="media/pic.png"><track src="media/pic.png" kind="subtitles"/></video>\n    <p>It says <q>read this</q> and stops.</p>',
    ],
  ),
  // Typed attribute value (O5): the slider's response mapping a key that is no integer.
  "Typed attribute value": passageAt(
    "Typed attribute value",
    item,
    '<qti-map-entry map-key="3" mapped-value="1"/>',
    [
      '<qti-map-entry map-key="three" mapped-value="1"/>',
      '<qti-map-entry map-key="3.5" mapped-value="1"/>',
    ],
  ),
  // Usage typed value (reading 105): the usage statistic's float value written as no float.
  "Usage typed value": passageAt(
    "Usage typed value",
    "usage.xml",
    '<value fieldIdentifier="F" baseType="float">0.5</value>',
    [
      '<value fieldIdentifier="F" baseType="float">half</value>',
      '<value fieldIdentifier="F" baseType="float">0,5</value>',
    ],
  ),
  // Variable declared (P8): the item's round reading a variable nothing declares.
  "Variable declared": passageAt(
    "Variable declared",
    item,
    '<qti-round><qti-variable identifier="SCORE"/></qti-round>',
    ['<qti-round><qti-variable identifier="ABSENT"/></qti-round>'],
  ),
  // value domain (each attribute's simple type): a count, a boolean or a shape that is no value
  // of its type.
  "value domain": {
    law: "value domain",
    mutate: replacing([
      {
        passage: '<qti-hottext-interaction response-identifier="HOT" max-choices="1">',
        path: item,
        replacements: [
          '<qti-hottext-interaction response-identifier="HOT" max-choices="one">',
          '<qti-hottext-interaction response-identifier="HOT" max-choices="1.5">',
        ],
      },
      {
        passage: 'shuffle="false" max-choices="1"',
        path: item,
        replacements: ['shuffle="no" max-choices="1"', 'shuffle="False" max-choices="1"'],
      },
    ]),
    over: "package",
  },
  // value domain, a card's support (reading R9-a), a mutation of its own beside the law's, so
  // the law's draws stay as they are under any fixed seed: the card's support outside its domain,
  // the other card's support padded, whose value is the form as written and so no other support's,
  // which "Card support" leaves to AL1, or a support the list does not name.
  "value domain, a card's support": {
    law: "value domain",
    mutate: replacing([
      {
        passage: card("sign-language"),
        path: item,
        replacements: [card(" keyword-translation "), card("keyword translation")],
      },
    ]),
    over: "package",
  },
} as const satisfies Readonly<Record<string, Mutation>>;
