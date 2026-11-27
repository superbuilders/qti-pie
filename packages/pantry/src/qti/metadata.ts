/**
 * The metadata overlays (plan §1.7 O6; the W5 amendment's C2, C3, C17 and C18; the tier-1
 * addendum's G-concat, G-parse and "Text in keys"; UP's port audit, B33 and B34; RV's B4): the
 * identifier, title and language of each assessment item and test, and the typed value of each
 * usage statistic's record value, with the laws that read them across rows, and the LOM terms the
 * metadata laws compare. A LOM record has no overlay: it is its `Node` rows alone, each leaf's text
 * its folded `stringValue` (`copiedTextKinds`, `copiedLangStringText` of `#pantry/qti/node.ts`),
 * which the laws over LOM read through queries (`#pantry/qti/queries.ts`), never through a copy
 * (the collections decisions' S5).
 *
 * A record names its document when it is a `lom:lom` child of the `cp:metadata` of a resource of
 * type `imsqti_item_xmlv3p0` or `imsqti_test_xmlv3p0` whose `href` names a document (reading
 * `resource-href`): the document a resource lists at the `href`'s path, whatever type it is read as
 * (reading `path-document-type`), never the manifest (reading `manifest-document`). No row stores
 * that a record names it: the database reads it from the record, its resource's `href` and `type`
 * and the listed document at that path (`namingRecords`, `#pantry/qti/queries.ts`). A file's record
 * describes the file, and an external record (a `lom:lom` that is its document's root) may describe
 * many items, so neither names one. A record whose resource's `href` names no document names none,
 * so no law reads it: there is no "associated item, test or object bank" (§2.7.1) to read it
 * against, and "Document entry" refuses the `href`. Spec reading `identity-from-lom`, as UP's audit
 * merges it (§2.2), reads the information model's "MUST be the same" (sections 4.1.1, 4.1.2, 4.4.1
 * and 4.4.2) through the metadata binding's LOM profile (QTI 3.0 Metadata §2.7.1, normative by its
 * §1.2):
 *
 * - **`lom-identifier`** (law "LomObjectIdentifier", §2.7.1.1: "One of the values given for the
 *   identifier must have an entry that matches the identifier of the associated item, test or
 *   object bank"): when the record's general category lists `identifier` entries, one of them is
 *   the document's identifier, compared collapsed. A meta-metadata or a relation's identifier is no
 *   general one, and is not read. A rule over the queries of `#pantry/qti/queries.ts` states it.
 * - **`lom-title`** (law "LomObjectTitle", §2.7.1.2: "The title must have a value that matches the
 *   value of the title attribute of the associated item, test or object bank. The language used to
 *   interpret the title is taken from the language attribute of the associated item, test or object
 *   bank"): when the record's general category has a `title`, one of its strings in the document's
 *   language is the document's `title`: a string whose `language` is the root's `xml:lang`, or one
 *   with no `language`, or any string where the root states no language. A root states none where
 *   it writes no `xml:lang`, or one whose collapsed form is no language tag (spec reading
 *   `item-lang-outside-domain`): an empty one, "just as if xml:lang had not been specified" (XML
 *   1.0 §2.12), one of whitespace alone, or an ill-formed one, which AL1 refuses under its own
 *   rule. An empty `language` is read as none alike. A rule over the queries of
 *   `#pantry/qti/queries.ts` states it.
 * - **`lom-learning-resource-type`** (law "LOM learning resource type", spec reading
 *   `lom-learning-resource-type`, §2.7.5.1: "QTI objects are designed to be reusable in a variety
 *   of assessment scenarios. Therefore, the LOM-defined values self assessment and exam are
 *   forbidden"): a `learningResourceType` of the LOM vocabulary holds neither, compared collapsed.
 *   Its term is the LOM vocabulary's when its `source` collapses to `LOMv1.0`, or to the empty
 *   source the binding's `default="LOMv1.0"` fills, or when it writes no `source`
 *   (`imsmd_loose_v1p3p2.xsd` line 1288); a term of any other source is another vocabulary's, which
 *   the binding does not enforce (§3.6), and is not refused (reading `nothing-valid-refused`). So
 *   the law is an existential, as `lom-identifier`'s is: a forbidden value's type has a source of
 *   another vocabulary (`OtherVocabularyType` of `#pantry/qti/queries.ts`), and a type that writes
 *   no source has no row there to name.
 * - **Usage typed value** (G-match, spec reading `usage-statistic-value`): a usage statistic's
 *   `ud:value` that forms part of a record, that is, writes a `fieldIdentifier`, and writes a
 *   `baseType` holds a value of that base type ("A class that can represent a single value of any
 *   baseType", the usage data binding's Value class, §2.6.5), its text read as a `qti-value`'s is,
 *   by `BaseTypePattern`; one outside a record, or that writes no `baseType`, is the XSD's
 *   `xs:normalizedString` text, a `baseType` outside a record being no base type to state
 *   (`UsageValueBaseType`, a view of `#pantry/qti/queries.ts`, holds each record's typed value).
 *
 * **`lom-title`'s comparisons.** The binding compares a title in `xs:normalizedString`'s value
 * space, where a tab, a line feed and a carriage return each read as a space (XML Schema 1.0 Part 2
 * §4.3.6, whiteSpace `replace`), and a language tag without regard to case (RFC 5646 §2.1.1), whose
 * subtags are ASCII (§2.1). So each side is compared in that form: a title by its
 * `Text.replaceWhitespace` (an object's `title` attribute's `value`, an `xs:normalizedString`'s
 * value, which the database generates, and a title string's folded `stringValue`, replaced in the
 * query), the root's `xml:lang` by its value
 * collapsed (an `xs:language`) and case-folded by `Text.lowerAscii` (its `LangValue`'s
 * `value`, `#pantry/qti/names.ts`), and a string's `language` attribute, an `xs:string`,
 * case-folded as written, in the query.
 *
 * "Compared collapsed" is stated over the texts the database collapses (`Text.collapse`, XML
 * Schema Part 2 §4.3.6): an entry's folded text is collapsed in the query, and an assessment
 * object's `identifier` is its attribute's `value`, generated from the text as written, collapsed
 * by its domain's class, so the law compares the collapsed values and no padding is refused
 * (reading `nothing-valid-refused`).
 *
 * A LOM record is read from `Node` by its nodes' `parent`, each leaf's text its folded
 * `stringValue`, so no row copies a fact of a record.
 *
 * The other metadata the package carries has no overlay, since no law reads it across rows: QTI
 * metadata, curriculum standards metadata and the rest of LOM are judged by their content models
 * (N5, N7) and their value domains (AL1, TextDomain), and a usage statistic's children by N5's
 * content order, with no ordering law of their own, and its `lastUpdated`, a `DateDType`, by its
 * value domain alone, xs:date's lexical space with the month lengths and the leap rule (AL1).
 *
 * Every check is named by its oracle law (`#pantry/test/oracle.ts` `LawName`) with spaces written
 * as underscores. `lom-identifier`, `lom-title`, `lom-learning-resource-type` and "Usage typed
 * value" read views, so they are rules over a query (`#pantry/qti/queries.ts`).
 *
 * @see {@link https://www.imsglobal.org/sites/default/files/spec/qti/v3/md-bind/index.html | QTI 3.0 Metadata, §2.7.1 The General Category}
 * @see {@link https://www.w3.org/TR/xmlschema-2/#rf-whiteSpace | XML Schema Part 2, whiteSpace}
 */
import type { NodeKind, ResourceType } from "#pantry/grammar/install.ts";

/**
 * The resource types whose LOM record names its document (reading `identity-from-lom`): an item's
 * and a test's.
 */
export const objectTypes = [
  "imsqti_item_xmlv3p0",
  "imsqti_test_xmlv3p0",
] as const satisfies readonly (typeof ResourceType.handles)[number][];

/**
 * The owner whose records name a resource: a resource's `cp:metadata`, whose parent is the
 * `cp:resource`.
 */
export const resourceMetadata = "cp:metadata.resource" satisfies (typeof NodeKind.handles)[number];

/**
 * The LOM vocabulary's source: the `source` the loose binding writes for a vocabulary term that
 * writes none, `default="LOMv1.0"` (`imsmd_loose_v1p3p2.xsd` line 1288,
 * `LearningResourceType.Type`).
 */
export const lomVocabulary = "LOMv1.0";

/**
 * The sources, collapsed, under which a learning resource type is a term of the LOM vocabulary
 * (spec reading `lom-learning-resource-type`): `LOMv1.0`, and the empty source the binding's
 * default fills. A source of whitespace alone collapses to the empty one.
 */
export const lomVocabularySources = ["", lomVocabulary] as const;

/**
 * The learning resource types QTI 3.0 Metadata forbids of the LOM vocabulary (§2.7.5.1: "the
 * LOM-defined values self assessment and exam are forbidden"), as their values collapse.
 */
export const forbiddenResourceTypes = ["exam", "self assessment"] as const;
