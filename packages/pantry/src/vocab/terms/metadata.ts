/**
 * The terms of metadata that the schema (`#pantry/qti/metadata.ts`, `identity.ts`, `queries.ts`)
 * and the importer (`#pantry/import/overlays/identity.ts`) both read: the LOM object
 * and statistic kinds, the document types a record describes, and the empty language. Each is a
 * function of the grammar's rosters alone, so loading this module builds no relation of the
 * schema.
 */
import type { DocumentType, NodeKind } from "#pantry/grammar/install.ts";

/**
 * The root kinds of the documents of `objectTypes` (`#pantry/qti/metadata.ts`), whose `identifier`,
 * `title` and `xml:lang` a record is compared with: an item's and a test's (QTI metadata binding
 * §2.7.1.1: "One of the values given for the identifier must have an entry that matches the
 * identifier of the associated item, test or object bank"; §2.7.1.2 likewise of the title).
 */
export const objectKinds = [
  "qti-assessment-item",
  "qti-assessment-test",
] as const satisfies readonly (typeof NodeKind.handles)[number][];

/**
 * The usage statistics, the kinds that carry `lastUpdated` (`imsqti_usagedatav3p0_v1p0.xsd`,
 * `CategorizedStatisticDType` and `OrdinaryStatisticDType`).
 */
export const statisticKinds = [
  "ud:ordinaryStatistic",
  "ud:categorizedStatistic",
] as const satisfies readonly (typeof NodeKind.handles)[number][];

/**
 * A usage statistic's value, `ValueDType` of `imsqti_usagedatav3p0_v1p0.xsd`, which may name its
 * base type in `baseType`.
 */
export const usageValueKind = "ud:value" satisfies (typeof NodeKind.handles)[number];

/**
 * The compared form of a language that states none: the empty text. An empty `xml:lang` states no
 * language, "just as if xml:lang had not been specified" (XML 1.0 §2.12), so a root that writes no
 * `xml:lang` and one whose `xml:lang` collapses to the empty text compare alike (`lom-title`, and
 * R26's forms in `#pantry/qti/identity.ts`); a `lom:string`'s empty `language` is read alike. An
 * `xml:lang` whose value is the empty text states no language, so it has no `LangValue`
 * (`#pantry/qti/names.ts`), which `lom-title` reads as none.
 *
 * @see {@link https://www.w3.org/TR/xml/#sec-lang-tag | XML 1.0, §2.12 Language Identification}
 */
export const noLanguage = "";

/**
 * The types of the documents a package's records are read from: its manifest's, `manifest`, the one
 * document of that type (`RootOfType`'s check), whose `cp:metadata` holds the package's and each
 * resource's records; and an external record file's, `resourcemetadata/xml`, whose root is a
 * `lom:lom` (spec reading 81: an external LOM metadata file, assessed against the loose LOM
 * binding; spec reading 122 places a record in a resource's metadata, the manifest's own or such
 * a file). The manifest is the package's one
 * `imsmanifest.xml` (IMS Content Packaging 1.2), and a `cp:metadata` of any other document
 * describes no part of the package (170356bd's ruling), so its `lom:*` elements are no record's.
 */
export const recordDocumentTypes = [
  "manifest",
  "resourcemetadata/xml",
] as const satisfies readonly (typeof DocumentType.handles)[number][];
