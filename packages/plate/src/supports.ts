/**
 * The accessibility supports a host enables for one candidate, which `<Item>` and `redact` take as
 * their `supports`: {@link Supports}, and {@link noSupports}, every support off.
 *
 * Two layers live here. The catalog layer names the supports whose catalog content an item holds
 * dormant until one is enabled: the fifteen predefined names of QTI's card `support` vocabulary and
 * its `ext:` extensions. The delivery layer holds the preferences of a Personal Needs and
 * Preferences document, a separate AfA PNP 3.0 document QTI never references, that plate reads: the
 * read-aloud, braille, sign language and keyword translation preferences the catalog cards are
 * chosen by, keyword emphasis, and the low-vision indications (magnification, inverted display
 * polarity). A host fills it from a PNP (`readPnp` in `#plate/pnp/read.ts`), from a testing
 * program's choice for every candidate, or by hand.
 *
 * Beside the contract, {@link PnpSupports} widens it with the preferences a PNP gives that no
 * reader reads yet, as `readPnp` reads them (reading `pnp-sets`): answer masking, alternative text,
 * captions, breaks, the long description's visibility, text-to-speech suppression, the tools, and
 * the display preferences beyond the three the contract keeps. {@link noPnpSupports} sets none of
 * them. When a reader comes to read one of those preferences, it moves into {@link Supports}.
 *
 * Each type is its Schema's: {@link SupportsSchema} checks a value a host built, such as one cast
 * from untyped code or assembled from a PNP, before it reaches a page, and
 * {@link PnpSupportsSchema} checks the wider value `readPnp` reads. A value either decodes is the
 * value it was given.
 *
 * @module
 */
import { regex } from "arkregex";
import { Option, Schema } from "effect";

/**
 * The predefined catalog supports, the card `support` vocabulary of QTI's information model in its
 * own order: a `qti-card` names one of these or an `ext:` extension, and its content stays dormant
 * until a host enables that support.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info, the SupportEnum vocabulary ("an extensible
 *   enumerated vocabulary. Extending the vocabulary makes use of a naming convention").
 */
export const catalogSupports = [
  "additional-directions",
  "audio-description",
  "braille",
  "glossary-on-screen",
  "high-contrast",
  "keyboard-directions",
  "keyword-translation",
  "linguistic-guidance",
  "long-description",
  "sign-language",
  "simplified-language-portions",
  "simplified-graphics",
  "spoken",
  "tactile",
  "transcript",
] as const;

/**
 * A predefined catalog support.
 */
export type CatalogSupport = (typeof catalogSupports)[number];

/**
 * A catalog support outside the predefined vocabulary, named by the `ext:` convention.
 */
export type ExtensionSupport = `ext:${string}`;

/**
 * The on-screen tools a PNP can ask for, by their AfA PNP 3.0 feature names.
 */
export const toolPreferences = [
  "calculator-on-screen",
  "dictionary-on-screen",
  "homophone-checker-on-screen",
  "line-reader",
  "note-taking-on-screen",
  "outliner-on-screen",
  "peer-interaction-on-screen",
  "spell-checker-on-screen",
  "thesaurus-on-screen",
  "visual-organizer-on-screen",
] as const;

/**
 * An on-screen tool a PNP can ask for.
 */
export type ToolPreference = (typeof toolPreferences)[number];

/**
 * The spoken support's reading types: a screen reader the candidate brings, or the
 * delivery system reading content aloud.
 */
const readingTypes = ["computer-read-aloud", "screen-reader"] as const;

/**
 * A value outside an AfA PNP 3.0 vocabulary, named by the `ext:` convention: `ext:` followed by
 * one or more non-space characters, the guide's spelling (row 2), wider than the schema's pattern,
 * which refuses a hyphen.
 */
export type PnpExtension = `ext:${string}`;

/**
 * The feature elements an AfA PNP 3.0 profile may hold, by the schema's local names, the three
 * sets excluded: the names a profile assigns and a set names.
 */
export const pnpFeatures = [
  "additional-directions",
  "additional-testing-time",
  "alternative-text",
  "answer-masking",
  "audio-description",
  "braille",
  "calculator-on-screen",
  "captions",
  "dictionary-on-screen",
  "encouragement",
  "environment",
  "glossary-on-screen",
  "hazard-avoidance",
  "high-contrast",
  "homophone-checker-on-screen",
  "input-requirements",
  "invert-display-polarity",
  "item-translation",
  "keyboard-directions",
  "keyword-emphasis",
  "keyword-translation",
  "language-of-interface",
  "layout-single-column",
  "line-reader",
  "linguistic-guidance",
  "long-description",
  "magnification",
  "note-taking-on-screen",
  "outliner-on-screen",
  "peer-interaction-on-screen",
  "sign-language",
  "simplified-graphics",
  "simplified-language-portions",
  "spell-checker-on-screen",
  "spoken",
  "tactile",
  "text-appearance",
  "thesaurus-on-screen",
  "transcript",
  "visual-organizer-on-screen",
] as const;

/**
 * A PNP feature, by the schema's local name (`spell-checker-on-screen`, never the guide's
 * `spell-checker`).
 */
export type PnpFeature = (typeof pnpFeatures)[number];

/**
 * The `hazard-avoidance` values the schema enumerates; the guide lists two of them (row 4).
 */
export const hazardAvoidances = [
  "flashing",
  "motion-simulation",
  "olfactory-hazard",
  "sound",
] as const;

/**
 * The `input-requirements` values: the schema's `full-keyboard-control` and `full-mouse-control`,
 * and the guide's `full-switch-control` and `full-touchscreen-control` (row 5).
 */
export const inputRequirementValues = [
  "full-keyboard-control",
  "full-mouse-control",
  "full-switch-control",
  "full-touchscreen-control",
] as const;

/**
 * The `restriction-type` values of `spoken`, in the schema's spelling: the guide's
 * `skip-chemical-equations` reads as `skip-chemistry-equations` (row 6).
 */
export const restrictionTypes = [
  "directions-only",
  "skip-chemistry-equations",
  "skip-math-equations",
  "unrestricted",
  "word-by-word",
] as const;

/**
 * The `braille-type` values, in the schema's spelling: the guide's `ubae` reads as `ebae`
 * (row 12).
 */
export const brailleTypes = ["ebae", "ueb"] as const;

/**
 * The `delivery-mode` values of `braille`; `refreshable` is the schema's default.
 */
export const brailleDeliveryModes = ["embossed", "refreshable"] as const;

/**
 * The `grade` values of `braille`; 2 is the schema's default.
 */
export const brailleGrades = [1, 2, 3] as const;

/**
 * The `math-type` values of `braille`.
 */
export const mathTypes = ["nemeth", "ueb"] as const;

/**
 * The `link-indication` values of `spoken`.
 */
export const linkIndications = ["different-voice", "none", "sound-effect", "speak-link"] as const;

/**
 * The `typing-echo` values of `spoken`.
 */
export const typingEchoes = ["characters", "characters-and-words", "none", "words"] as const;

/**
 * The `generic-font-face` values of `text-appearance`'s `font-face`, `sans serif` with its space.
 */
export const genericFontFaces = [
  "cursive",
  "fantasy",
  "monospaced",
  "sans serif",
  "serif",
] as const;

/**
 * The calculator types: the `calculator-type` values of `calculator-on-screen`, which a PNP may
 * extend with `ext:`, and the closed enumeration of a companion calculator's `qti-calculator-type`
 * (CalculatorDType).
 */
export const calculatorTypes = ["basic", "graphing", "scientific", "standard"] as const;

/**
 * A calculator type, one of {@link calculatorTypes}.
 */
export type CalculatorType = (typeof calculatorTypes)[number];

/**
 * The features whose `xml:lang` {@link PnpSupports.languages} keeps: `language-of-interface`'s
 * goes to {@link DisplayPreferences.languageOfInterface}, `keyword-translation`'s to
 * {@link Supports.keywordTranslationLanguage} and `sign-language`'s to
 * {@link Supports.signLanguage}.
 */
export const languageFeatures = ["item-translation"] as const;

/**
 * A feature that names a language.
 */
export type LanguageFeature = (typeof languageFeatures)[number];

/**
 * A finite number above 0: a magnification.
 */
const positive = Schema.Finite.check(Schema.isGreaterThan(0));

/**
 * A catalog support: a predefined name, or an `ext:` extension in the form a card's `support`
 * takes, `SupportExtStringDType`'s pattern `(ext:)[a-zA-Z0-9_\.\-]+` (the ASI XSD), so a host
 * enables no support no card can name.
 */
const catalogSupport = Schema.Union([
  Schema.Literals(catalogSupports),
  Schema.TemplateLiteral(["ext:", Schema.String]).check(
    Schema.isPattern(regex("^ext:[a-zA-Z0-9_.-]+$", "u")),
  ),
]);

/**
 * An optional colour or language, as written.
 */
const written = Schema.Option(Schema.String);

/**
 * The text and background colours a candidate chose, each as a CSS colour, none for the
 * default.
 */
const textAppearance = Schema.Struct({ backgroundColor: written, fontColor: written });

/**
 * A value outside a PNP vocabulary: `ext:` followed by one or more non-space characters.
 */
const pnpExtension = Schema.TemplateLiteral(["ext:", Schema.String]).check(
  Schema.isPattern(regex("^ext:\\S+$", "u")),
);

/**
 * A value of a PNP vocabulary, or an `ext:` extension of it.
 *
 * @param values The vocabulary's values.
 * @returns The Schema of a value or an extension.
 */
const extensible = <const Values extends readonly string[]>(values: Values) =>
  Schema.Union([Schema.Literals(values), pnpExtension]);

/**
 * The colours of `invert-display-polarity`, each as written.
 */
const polarityColors = Schema.Struct({ background: written, foreground: written });

/**
 * A `font-size` as the document gives it: the schema's points (default 12.0) or the guide's
 * factor "relative to the base font size" (row 10). A value under 4 is a factor, any other is
 * points, since no readable text is 3 points tall and no candidate asks for text 4 times the base.
 */
const fontSize = Schema.Struct({
  kind: Schema.Literals(["factor", "points"]),
  value: Schema.Finite,
});

/**
 * The Schema of {@link TextPreferences}.
 *
 * `colorTheme` is the guide's `color-theme`, which the schema lacks (row 1), so it has no
 * vocabulary and is the value as written. `fontNames` are the `font-name` values of `font-face`,
 * in order. `letterSpacing` is the number as written, in pixels (row 11). `lineSpacing`,
 * `lineHeight` and `wordSpacing` are the numbers as written.
 */
const textPreferences = Schema.Struct({
  colorTheme: written,
  fontNames: Schema.Array(Schema.String),
  fontSize: Schema.Option(fontSize),
  genericFontFace: Schema.Option(Schema.Literals(genericFontFaces)),
  letterSpacing: Schema.Option(Schema.Finite),
  lineHeight: Schema.Option(Schema.Finite),
  lineSpacing: Schema.Option(Schema.Finite),
  uniformFontSizing: Schema.Boolean,
  wordSpacing: Schema.Option(Schema.Finite),
  wordWrapping: Schema.Boolean,
});

/**
 * The `text-appearance` feature's preferences beyond the colours {@link textAppearance} carries.
 */
export type TextPreferences = typeof textPreferences.Type;

/**
 * The Schema of {@link DisplayPreferences}, field by field:
 *
 * - `invertDisplayPolarity`: whether the presentation colours are inverted;
 * - `invertedColors`: the colours `invert-display-polarity` names, each as written, none when the
 *   feature is off;
 * - `keywordEmphasis`: whether text of the class `qti-keyword-emphasis` is given more emphasis ;
 * - `languageOfInterface`: the language of the interface's own text, as a BCP 47 tag, none for the
 *   configuration's locale;
 * - `layoutSingleColumn`: whether content is laid out in a single column where it can be;
 * - `magnification`: the magnification factor, none for no magnification;
 * - `text`: the `text-appearance` preferences beyond the two colours, none when the feature is off;
 * - `textAppearance`: the text and background colours, none for the defaults.
 */
const displayPreferences = Schema.Struct({
  invertDisplayPolarity: Schema.Boolean,
  invertedColors: Schema.Option(polarityColors),
  keywordEmphasis: Schema.Boolean,
  languageOfInterface: Schema.Option(Schema.String),
  layoutSingleColumn: Schema.Boolean,
  magnification: Schema.Option(positive),
  text: Schema.Option(textPreferences),
  textAppearance: Schema.Option(textAppearance),
});

/**
 * The display preferences of the A family a PNP gives.
 */
export type DisplayPreferences = typeof displayPreferences.Type;

/**
 * The {@link DisplayPreferences} a reader reads, the display preferences the contract carries:
 * keyword emphasis, which `<Item>` writes on the item's root, and magnification and inverted
 * display polarity, which show low-vision indications (reading `pnp-low-vision`, `carriedClass` in
 * `#plate/vocabulary.ts`).
 */
const displaySupports = displayPreferences.mapFields((fields) => ({
  invertDisplayPolarity: fields.invertDisplayPolarity,
  keywordEmphasis: fields.keywordEmphasis,
  magnification: fields.magnification,
}));

/**
 * The Schema of {@link BraillePreferences}; `language` is the braille's `xml:lang` as written.
 */
const braillePreferences = Schema.Struct({
  brailleType: Schema.Option(extensible(brailleTypes)),
  deliveryMode: extensible(brailleDeliveryModes),
  grade: Schema.Literals(brailleGrades),
  language: written,
  mathType: Schema.Option(extensible(mathTypes)),
});

/**
 * The `braille` feature's preferences, with the schema's defaults where the document says nothing.
 */
export type BraillePreferences = typeof braillePreferences.Type;

/**
 * The fields of a {@link Supports}, which {@link SupportsSchema} checks and
 * {@link PnpSupportsSchema} widens. The catalog cards (`#plate/content/catalog-info.ts`) read each
 * but the display, which `<Item>` and the low-vision rule read.
 *
 * - `braille`: the braille support's preferences, none when it is off; a card entry's
 *   `data-braille-type` is matched against its braille type;
 * - `catalog`: the catalog supports enabled, predefined or `ext:`; a card naming one shows its
 *   content;
 * - `keywordTranslationLanguage`: the language of `keyword-translation`, its `xml:lang` as written,
 *   none when the feature is off or names none; a keyword-translation card entry's `xml:lang` is
 *   matched against it;
 * - `readAloud`: the spoken support's reading type, none when the spoken support is off;
 * - `signLanguage`: the sign language chosen, `sign-language`'s `xml:lang` as written (a BCP 47 tag
 *   such as `ase`), none when the feature is off or names none; a sign-language card entry's
 *   `xml:lang` is matched against it.
 */
const supportsFields = {
  braille: Schema.Option(braillePreferences),
  catalog: Schema.ReadonlySet(catalogSupport),
  display: displaySupports,
  keywordTranslationLanguage: written,
  readAloud: Schema.Option(Schema.Literals(readingTypes)),
  signLanguage: written,
} as const;

/**
 * The checks of a {@link Supports}: every field present, each catalog support predefined or
 * `ext:`, each braille value the schema's spelling or an `ext:` value where the vocabulary takes
 * one, each factor, number of minutes and magnification a finite number above 0. A value it
 * decodes is the value it was given.
 */
export const SupportsSchema = Schema.Struct(supportsFields);

/**
 * The supports a host enables for one candidate: the catalog supports whose dormant content
 * shows, and the PNP's delivery preferences.
 */
export type Supports = typeof SupportsSchema.Type;

/**
 * Every support off: no catalog support, no preference, no tool. `<Item>` and `redact` read an
 * absent `supports` as this value, and catalog content stays dormant under it.
 */
export const noSupports: Supports = {
  braille: Option.none(),
  catalog: new Set(),
  display: { invertDisplayPolarity: false, keywordEmphasis: false, magnification: Option.none() },
  keywordTranslationLanguage: Option.none(),
  readAloud: Option.none(),
  signLanguage: Option.none(),
};

/**
 * The Schema of {@link SpokenPreferences}: the pitch is 0.5 by default, the speech rate 180 and
 * the volume 0.5.
 */
const spokenPreferences = Schema.Struct({
  linkIndication: Schema.Option(Schema.Literals(linkIndications)),
  pitch: Schema.Finite,
  readingType: Schema.Literals(readingTypes),
  restrictions: Schema.ReadonlySet(extensible(restrictionTypes)),
  speechRate: Schema.Finite,
  typingEcho: Schema.Option(Schema.Literals(typingEchoes)),
  volume: Schema.Finite,
});

/**
 * The `spoken` feature's preferences, with the schema's defaults where the document says nothing.
 */
export type SpokenPreferences = typeof spokenPreferences.Type;

/**
 * The settings of the on-screen tools that take one: `calculator-on-screen`'s `calculator-type`,
 * and `line-reader`'s `highlight-color` as written.
 */
const toolSettings = Schema.Struct({
  calculatorType: Schema.Option(extensible(calculatorTypes)),
  highlightColor: written,
});

/**
 * A PNP feature, by the schema's local name.
 */
const pnpFeature = Schema.Literals(pnpFeatures);

/**
 * The checks of a {@link PnpSupports}: the checks of {@link SupportsSchema}, and every PNP-only
 * field present, each feature one of the PNP's, each vocabulary value the schema's spelling or an
 * `ext:` value where the vocabulary takes one. A value it decodes is the value it was given, the
 * contract's fields and the PNP's alike.
 *
 * Its PNP-only fields, beside the contract's:
 *
 * - `alternativeText` and `captions`: whether the PNP feature of that name is on, which a PNP turns
 *   on by assigning it without `prohibit-set` naming it;
 * - `answerMasking`: whether a Choice's choices start covered, each uncovered by the candidate;
 * - `breaks`: `environment`'s `breaks`;
 * - `display`: every display preference, the contract's three among them;
 * - `longDescriptionVisible`: whether `long-description` is shown rather than hidden visually, the
 *   negation of its `hide-visually`, which defaults to true;
 * - `suppressTts`: whether text-to-speech is suppressed for the whole item, as
 *   `data-qti-suppress-tts` suppresses it for the content it marks;
 * - `tools`: the on-screen tools the PNP asks for;
 * - `atStart`: the features `activate-at-initialization-set` names, or the guide's
 *   `activate-at-initiation-set` (row 7), that `prohibit-set` does not: those the profile turns on
 *   when the test begins. Each is in `features`, whether or not the profile assigns it.
 * - `features`: the active features, every feature in `atStart`, and every feature the profile
 *   assigns that neither `activate-as-option-set` nor `prohibit-set` names, the features the
 *   contract has no field for (`item-translation`, `encouragement`) included.
 * - `ignored`: the elements of the profile that were read past, each as `{namespace}local`: every
 *   element in a namespace that is not a PNP namespace, and every PNP element no feature is named
 *   by.
 * - `languages`: the `xml:lang` of each language feature, as written.
 * - `optional`: the features `activate-as-option-set` names that `prohibit-set` does not: those the
 *   test taker may turn on. One that `atStart` also holds is active; any other is off at start and
 *   not in `features`, and its settings are not read, even where the profile assigns it.
 * - `prohibited`: the features of `prohibit-set`.
 */
export const PnpSupportsSchema = Schema.Struct({
  ...supportsFields,
  alternativeText: Schema.Boolean,
  answerMasking: Schema.Boolean,
  atStart: Schema.ReadonlySet(pnpFeature),
  breaks: Schema.Boolean,
  captions: Schema.Boolean,
  display: displayPreferences,
  features: Schema.ReadonlySet(pnpFeature),
  hazards: Schema.ReadonlySet(extensible(hazardAvoidances)),
  ignored: Schema.Array(Schema.String),
  inputRequirements: Schema.ReadonlySet(extensible(inputRequirementValues)),
  languages: Schema.ReadonlyMap(Schema.Literals(languageFeatures), Schema.String),
  longDescriptionVisible: Schema.Boolean,
  optional: Schema.ReadonlySet(pnpFeature),
  prohibited: Schema.ReadonlySet(pnpFeature),
  spoken: Schema.Option(spokenPreferences),
  suppressTts: Schema.Boolean,
  toolSettings,
  tools: Schema.ReadonlySet(Schema.Literals(toolPreferences)),
});

/**
 * The supports a PNP asks for: the contract's {@link Supports}, every field of it as the PNP sets
 * it, and the preferences a PNP gives that no renderer reads yet. A `PnpSupports` is a `Supports`,
 * so a host passes it to `<Item>` and `redact` as it is, and they read only the contract's fields.
 *
 * The profile's sets decide which features are active (spec-readings reading `pnp-sets`). A feature
 * `activate-at-initialization-set` names is active whether or not the profile assigns it; a
 * feature the profile assigns is active unless `activate-as-option-set` names it and the
 * at-initialization set does not, which leaves it off at start; and `prohibit-set` wins over both
 * sets and over an assignment: a prohibited feature is in `prohibited` and in no other field, and
 * sets nothing. Only an active feature's settings are read, one the profile gives no element of
 * its own reading with the Schema's defaults. Every vocabulary value is in the schema's spelling,
 * each of the guide's read as its schema counterpart.
 */
export type PnpSupports = typeof PnpSupportsSchema.Type;

/**
 * Every support off and no PNP preference given: {@link noSupports} with every PNP-only field
 * empty, the value `readPnp` reads from an empty profile.
 */
export const noPnpSupports: PnpSupports = {
  ...noSupports,
  alternativeText: false,
  answerMasking: false,
  atStart: new Set(),
  breaks: false,
  captions: false,
  display: {
    ...noSupports.display,
    invertedColors: Option.none(),
    languageOfInterface: Option.none(),
    layoutSingleColumn: false,
    text: Option.none(),
    textAppearance: Option.none(),
  },
  features: new Set(),
  hazards: new Set(),
  ignored: [],
  inputRequirements: new Set(),
  languages: new Map(),
  longDescriptionVisible: false,
  optional: new Set(),
  prohibited: new Set(),
  spoken: Option.none(),
  suppressTts: false,
  toolSettings: { calculatorType: Option.none(), highlightColor: Option.none() },
  tools: new Set(),
};
