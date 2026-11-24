/**
 * The texts of a stored package's identity, a package's name and an entry's path, the bounds the
 * store holds a text to, and the measure and forms it reads texts by.
 *
 * A key holds each of its texts as itself: grizzle hashes no key behind its author's back. It
 * refuses, when the schema compiles, a key whose B-tree entry a text of no byte bound could outgrow
 * (`UnrepresentableKey`), and an index it plans for a lookup leaves such a text out, a filter
 * beside the index that its comment names. So each kind of text a key holds has one byte bound: a
 * package's name the store's own, {@link nameMaxBytes}, and every other what one B-tree entry
 * leaves it in the widest key it stands in, beside the bounds before it (each a `derived` limit
 * below, naming that key); a longer text is refused at import under "Key text bound". A text no
 * bound fits (an attribute's value, a file's href) is no key's: a lookup compares its explicit
 * SHA-256 digest field first. No ordered read orders by a name, a prefix or a path, which the host
 * orders instead. Each other bound is PostgreSQL's, a stated limit of the representation: the regex
 * engine's, which bounds a text a query reads by a pattern ({@link matchedText}), a foreign
 * element's expanded name among them ({@link foreignNameBytes}); and the decimal parse's, which a
 * parse guards its own operand by ({@link parsedDecimalBytes}).
 */
import {
  law,
  lexicalForm,
  Logic,
  Num,
  pg,
  regexTextMaxBytes,
  str,
  Text,
  Type,
} from "@bjornpagen/grizzle";
import type { Facts, Term } from "@bjornpagen/grizzle";
import { anyText, Chars, isChars } from "#pantry/grammar/install.ts";
import { entryOf } from "#pantry/vocab/laws.ts";
import { publishedTemplates, urisOf } from "#pantry/qti/templates.ts";

/**
 * An NCName (Namespaces in XML 1.0, §3): XML 1.0's `NameStartChar` without the colon, then its
 * `NameChar`s without the colon, each the class of the ranges XML 1.0 lists.
 *
 * @see {@link https://www.w3.org/TR/xml-names/#NT-NCName | Namespaces in XML 1.0, NCName}
 */
const ncName =
  "[A-Z_a-z\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2FF}\\u{370}-\\u{37D}\\u{37F}-\\u{1FFF}\\u{200C}-\\u{200D}\\u{2070}-\\u{218F}\\u{2C00}-\\u{2FEF}\\u{3001}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFFD}\\u{10000}-\\u{EFFFF}][\\-.0-9A-Z_a-z\\u{B7}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{37D}\\u{37F}-\\u{1FFF}\\u{200C}-\\u{200D}\\u{203F}-\\u{2040}\\u{2070}-\\u{218F}\\u{2C00}-\\u{2FEF}\\u{3001}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFFD}\\u{10000}-\\u{EFFFF}]*";

/**
 * The most UTF-8 bytes a name of a directory entry holds: Linux's `NAME_MAX`. The name of every
 * package the store holds is one ({@link PackageName}).
 *
 * @limitKind published
 * @owner Linux v7.0's UAPI limits.h (the kernel the importers run on)
 * @unit UTF-8 bytes
 * @scope one name of a directory entry: a package's name, `Package.name` and every row's `package`
 * @constraint compile-time constant
 * @source https://github.com/torvalds/linux/blob/v7.0/include/uapi/linux/limits.h#L12
 * @quote #define NAME_MAX         255
 * @verified 2026-11-21
 */
export const nameMaxBytes = 255;

/**
 * A package's name in the store: the name its importer's caller gives it, an NCName of at most
 * {@link nameMaxBytes} UTF-8 bytes, which every key, reference and family holds as itself.
 * `Package` is keyed by it, and every row of the package holds it as its `package`, the key of the
 * Package unit (`PackageUnit`, `#pantry/qti/package.ts`), so two packages are two names, and an
 * import of another package under a stored name is refused: a stored package is never replaced.
 *
 * Its bound is a directory entry's name's. Every producer of the store's packages writes a package
 * as a directory named by its name before it is stored: edullm's AlphaScience import names a
 * lesson's package `${lesson}-${digest}` (`packages/data/alphascience-import/src/package.ts:752`)
 * and writes it under that name (`build.ts:65`); metis's AlphaTest import names a test's package
 * `${test}-${digest}` (`packages/alphatest-import/src/package.ts:186`) and writes it to
 * `packages/<name>/` (`package-store.ts:41`); and the reset's put plan reads each package from a
 * directory of its name. So no producer can write a package under a longer name. No other use of a
 * name is tighter: the QTI app puts it in a URL as one encoded segment, and media are stored by
 * digest, never by name. The name is the importer's caller's own, not QTI's, so this bound is its
 * own to keep.
 *
 * It is no part of the package. A manifest's `identifier` (IMS Content Packaging 1.2, §6.11.4) is
 * "unique within the Manifest" alone, and its `version` "is used to distinguish between manifests
 * with the same identifier", so two packages may share an identifier, as four groups of 1EdTech's
 * example packages do: the identifier is the package's data (its `Attribute`'s `value`), never
 * its key. An NCName is an `xs:ID`'s collapsed lexical form, so a manifest identifier is a name a
 * caller may choose.
 */
export const PackageName = law(
  entryOf("Package key"),
  str.bytes(nameMaxBytes, str.regex(`^${ncName}$`)),
);

/**
 * The most UTF-8 bytes an entry's path holds: what one B-tree entry leaves each path in the widest
 * key grizzle builds over paths, `Instance`'s lookup, which holds three, beside a package's name.
 * Paths are in more keys than any other text, so they are bounded first and every other key text
 * takes what its widest key leaves beside them.
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one entry path in any key or index grizzle builds over it
 * @constraint IMS Content Packaging puts no bound on a path; a longer one is refused at import, a
 *   known deviation, dated 2026-11-22, until EntryPath's own digest re-key, the pin after pin+2 (a
 *   `pathDigest` the import writes in every primary key, as `IdrefTarget.idDigest` is): the longest
 *   real path is 88 bytes (363 exported packages and 2,813 converted AlphaTest packages,
 *   2026-11-22), 11% of the bound
 * @derivation grizzle's `keyTextBytes` over `Instance`'s lookup `(package, assemblyKind, assembly,
 *   document, parent, siteDocument, site)`, three paths beside a name of {@link nameMaxBytes},
 *   two naturals and a code: the most each of the three paths can hold
 * @from nameMaxBytes
 */
export const entryPathBytes = 790;

/**
 * A package entry's path, relative to the package root, as the package reader gives it: no leading
 * `/`, its segments `/`-separated, any other character allowed, of at most {@link entryPathBytes}
 * UTF-8 bytes, so every key holds it as itself. IMS Content Packaging puts no bound on an entry's
 * path, so a longer one is refused at import under "Key text bound": a known deviation from the
 * specification until the path's digest re-key ({@link entryPathBytes}), not a limit of QTI. No
 * index orders by one (a package's entries are read as a set, `#pantry/export/scan.ts`
 * `entriesOf`, and ordered on the host).
 *
 * The reader refuses an absolute path, a backslash and a `..` segment (`#pantry/package/zip.ts`,
 * `#pantry/package/read.ts`); the pattern restates none of that. A file's identity in its package:
 * `Entry`, `Document` and every row of a document hold it as their `path`, and a reference resolved
 * in the package names its target by one.
 */
export const EntryPath = law(
  entryOf("Key text bound"),
  str.bytes(entryPathBytes, str.regex("^[^/].*$", "su")),
);

/**
 * A text a query reads where it stands, as a view casts it into a key text: a plain text term of
 * any origin, an attribute's value or a node's string value as a rule reads it.
 */
type TextTerm = Term<string, unknown, unknown, "text", string, Facts, string>;

/**
 * The most UTF-8 bytes a QTI identifier holds in a key: what one B-tree entry leaves each
 * identifier in the widest key that holds them, the ledger's snapshot pair keys, which hold three.
 * REPRKEY's key-text table measures real identifiers at 83 bytes.
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one QTI identifier, or an item variable's name, in any key or index grizzle builds over it
 * @constraint QTI's identifier (`IdentifierDType`, an NCName) has no length bound; a longer one is
 *   refused at import, a known deviation, dated 2026-11-22, until its digest re-key, after the
 *   singleton-migration wipe, one pantry, ledger and application migration with writer-supplied
 *   digests (the ledger keys every value by its variable's identifier): the longest real identifier
 *   is 83 bytes (363 exported packages and 2,813 converted AlphaTest packages, 2026-11-22), 17% of
 *   the bound
 * @derivation grizzle's `keyTextBytes` over the primary keys of the ledger's `SnapshotMultiplePair`
 *   and `SnapshotMultipleDirectedPair`, `(child, package, path, n, at, variable, least | source,
 *   greatest | target)`, three identifiers beside a learner of 69 bytes, a name of
 *   {@link nameMaxBytes}, a path of {@link entryPathBytes} and two naturals, judged in grizzle's
 *   worst column order; the pair and record-identifier keys `(child, stage, package, path, kind,
 *   variable, least, greatest)` and `NumberedReading`'s lookup `(package, variable, assembly, scope,
 *   scopeInstance, scopePath)` fit it too
 * @from nameMaxBytes, entryPathBytes
 */
export const identifierBytes = 503;

/**
 * A QTI identifier as a key holds it, of at most {@link identifierBytes} UTF-8 bytes: a
 * declaration's, a choice's, a reference's or an item variable's name.
 */
export const QtiIdentifier = law(entryOf("Key text bound"), str.bytes(identifierBytes, Chars));

/**
 * The most UTF-8 bytes a LOM text holds where a view keys it (`#pantry/qti/lom.ts`): a
 * classification's taxon path's source and each of its taxa's id and entry strings
 * (`PackageClassification`, `TaxonEntry`), a lesson's catalog and entry (`Lesson`, `Head`), a
 * relation's target's catalog and entry (`PackageRelation`) and an earlier package's name
 * (`Supersedes`).
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one LOM text in any key or index grizzle builds over it
 * @constraint IEEE 1484.12.1 puts no bound on a CharacterString; a longer one is refused at import
 *   under "Key text bound": the longest real one is 73 bytes, a lesson's entry (relation entries at
 *   most 70, an earlier package's name at most 70, taxon entries at most 65, catalogs at most 50,
 *   taxon sources at most 50 and ids at most 34), over the 364 published packages (the 23 shadows,
 *   the 183 Ram lessons and the alphascience lessons), the 118 metis packages and 080622Z's 2,813
 *   AlphaTest packages, 2026-11-24, 9% of the bound
 * @derivation grizzle's `keyFits` over `TaxonEntry`'s whole heading `(package, source, id, entry)`,
 *   three LOM texts beside a name of {@link nameMaxBytes}, the widest key that holds them: the most
 *   each of the three can hold
 * @from nameMaxBytes
 */
export const lomTextBytes = 804;

/**
 * A LOM text as a key holds it, of at most {@link lomTextBytes} UTF-8 bytes.
 */
export const LomText = law(entryOf("Key text bound"), str.bytes(lomTextBytes, Chars));

/**
 * The most UTF-8 bytes a language tag holds where a view keys it, case-folded: a language a
 * document's `xml:lang` states and one a LOM `general` category lists (`DescribedLang`,
 * `DescribedAssembledLang`, `ListedLang`, `#pantry/qti/queries.ts`).
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one language tag in any key or index grizzle builds over it
 * @constraint RFC 5646 and `xs:language` bound no tag's length, its subtags any in number; a longer
 *   one is refused at import under "Key text bound": the longest real one is 7 bytes, of 3 distinct
 *   (`en`, `en-us`, `english`) in 81,204 `xml:lang` values and 336 LOM languages (364 published
 *   packages, 118 metis packages and 080622Z's 2,813 AlphaTest packages, 2026-11-24), 0.4% of the
 *   bound
 * @derivation grizzle's `keyTextBytes` over `DescribedLang`'s and `ListedLang`'s whole headings
 *   `(general, package, path, value)`: a tag beside a natural, a name of {@link nameMaxBytes} and a
 *   path of {@link entryPathBytes}
 * @from nameMaxBytes, entryPathBytes
 */
export const langTextBytes = 1607;

/**
 * A language tag as a key holds it, of at most {@link langTextBytes} UTF-8 bytes.
 */
export const LangText = law(entryOf("Key text bound"), str.bytes(langTextBytes, Chars));

/**
 * The most UTF-8 bytes a regular expression holds where a view keys it: an interaction's
 * `pattern-mask` and a pattern match's literal `pattern` (`PatternText`,
 * `#pantry/qti/overlay-queries/interaction.ts`).
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one pattern in any key or index grizzle builds over it
 * @constraint XML Schema's regular expressions (Part 2, Appendix F) have no length bound; a longer
 *   one is refused at import under "Key text bound": the longest real one is 349 bytes, in 911,715
 *   patterns (364 published packages, 118 metis packages and 080622Z's 2,813 AlphaTest packages,
 *   2026-11-24), 22% of the bound
 * @derivation grizzle's `keyTextBytes` over `PatternText`'s whole heading `(package, path,
 *   pattern, start)`: a pattern beside a name of {@link nameMaxBytes}, a path of
 *   {@link entryPathBytes} and a natural
 * @from nameMaxBytes, entryPathBytes
 */
export const patternTextBytes = 1607;

/**
 * A regular expression as a key holds it, of at most {@link patternTextBytes} UTF-8 bytes.
 */
export const PatternKey = law(entryOf("Key text bound"), str.bytes(patternTextBytes, Chars));

/**
 * Cast a text a view keys into a bounded key text's type, under grizzle's byte guard (README, "A
 * byte bound is a guard"). The guard's other arm, the empty text, is unreachable in every committed
 * state: each view that keys one states "Key text bound" over the very texts it casts
 * (`DeclaredIdentifierText` of `#pantry/qti/names.ts` for a declaration's identifier,
 * `TestIdentifierText` of `#pantry/qti/overlay-queries/tests.ts` for a test's, `LomKeyText` of
 * `#pantry/qti/lom.ts` for the LOM texts, `LangKeyText` of `#pantry/qti/queries.ts` for language
 * tags, `PatternKeyText` of `#pantry/qti/overlay-queries/interaction.ts` for patterns,
 * `TableKeyText` of `#pantry/qti/mapping.ts` for map keys and lookup values), which
 * refuses at its import a package that holds one past its bound, by name. A view that keys a text
 * its check does not cover is a defect of that view, never a value of the empty text.
 *
 * @param text - The text, an attribute's value or a node's string value as the view reads it.
 * @param type - The key text's type, {@link QtiIdentifier}, {@link LomText}, {@link LangText},
 *   {@link PatternKey}, {@link LiteralText} or {@link TemplateUri}: a bounded run of XML `Char`s,
 *   whose TypeScript type every such bound shares.
 * @param bytes - That type's byte bound.
 * @returns It, as a key holds it.
 */
const keyedAs = (text: TextTerm, type: typeof QtiIdentifier, bytes: number) =>
  Logic.when(
    Num.within(Text.octetLength(text), 0, bytes),
    () => Type.cast(text, type),
    Type.literal(type, ""),
  );

/**
 * Cast a QTI identifier a view keys into {@link QtiIdentifier} ({@link keyedAs}).
 *
 * @param identifier - The identifier, an attribute's value as the view reads it.
 * @returns It, as a key holds it.
 */
export const keyedIdentifier = (identifier: TextTerm) =>
  keyedAs(identifier, QtiIdentifier, identifierBytes);

/**
 * Cast a LOM text a view keys into {@link LomText} ({@link keyedAs}).
 *
 * @param text - The text, a node's string value as the view reads it.
 * @returns It, as a key holds it.
 */
export const keyedLomText = (text: TextTerm) => keyedAs(text, LomText, lomTextBytes);

/**
 * Cast a language tag a view keys into {@link LangText} ({@link keyedAs}).
 *
 * @param tag - The tag, case-folded, as the view reads it.
 * @returns It, as a key holds it.
 */
export const keyedLangText = (tag: TextTerm) => keyedAs(tag, LangText, langTextBytes);

/**
 * Cast a regular expression a view keys into {@link PatternKey} ({@link keyedAs}).
 *
 * @param pattern - The pattern, an attribute's value as the view reads it.
 * @returns It, as a key holds it.
 */
export const keyedPattern = (pattern: TextTerm) => keyedAs(pattern, PatternKey, patternTextBytes);

/**
 * The most UTF-8 bytes a URI value holds in the ledger's response keys (`UriValue` of the QTI
 * ledger). Pantry keys no URI as itself: an open attribute's namespace name is held by its SHA-256
 * (`OpenAttribute.uriDigest`, `#pantry/qti/attributes.ts`), of any length.
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one URI response value in any key the ledger builds over it
 * @constraint RFC 3986 puts no bound on a URI; a longer response is refused where the ledger
 *   records it, a known deviation, dated 2026-11-22, until its digest re-key, after the
 *   singleton-migration wipe, one pantry, ledger and application migration with writer-supplied
 *   digests, with the identifier's: no real response value is measured near it
 * @derivation held at the bound it took when `OpenAttributeEntity`'s key `(package, path, start,
 *   uri, local, offset)` held a namespace name beside a name of {@link nameMaxBytes}, a path of
 *   {@link entryPathBytes} and a local name of at most 793 bytes, which the ledger's URI response
 *   keys fit
 * @from nameMaxBytes, entryPathBytes
 */
export const uriBytes = 792;

/**
 * The most UTF-8 bytes an element's namespace name holds where an open attribute's laws key it
 * (`OpenAttribute.elementNamespace`, `#pantry/qti/attributes.ts`): what one B-tree entry leaves it
 * beside the rest of the lookup its rules probe it by.
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one element's namespace name in any key or index grizzle builds over an open attribute's
 * @constraint Namespaces in XML and RFC 3986 put no bound on a namespace name; a longer one is
 *   refused at import under "Key text bound": the longest real one is 51 bytes, of 5 distinct names
 *   in 306,002 declarations of 115,452 XML documents (2,813 converted AlphaTest packages of
 *   20261123T080622Z, 364 published packages and 118 metis packages, 2026-11-24), 3% of the bound
 * @derivation grizzle's `keyTextBytes` over the lookup "Foreign attribute class" probes an open
 *   attribute by, `(elementNamespace, kind, package, path, start)`: the namespace name beside a code,
 *   a name of {@link nameMaxBytes}, a path of {@link entryPathBytes} and a natural
 * @from nameMaxBytes, entryPathBytes
 */
export const namespaceNameBytes = 1604;

/**
 * An element's namespace name as an open attribute's key holds it, of at most
 * {@link namespaceNameBytes} UTF-8 bytes, empty for none.
 */
export const ElementNamespace = law(
  entryOf("Key text bound"),
  str.bytes(namespaceNameBytes, anyText),
);

/**
 * The most UTF-8 bytes a base value's text holds: what one B-tree entry leaves it in the ledger's
 * human operator keys, whose rubric is a base value's text (the ledger's `RubricName`), the widest
 * key that holds one; `Literal`'s reference target `(package, path, start, text, baseType)` leaves
 * it more.
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one `qti-base-value`'s text in any key or index grizzle builds over it
 * @constraint QTI puts no bound on a base value; a longer one is refused at import, a known
 *   deviation, dated 2026-11-22, until its digest re-key, after the singleton-migration wipe, one
 *   pantry, ledger and application migration with writer-supplied digests (the ledger keys a human
 *   score by its rubric, a base value's text): the longest real base value is 75 bytes (363
 *   exported packages and 2,813 converted AlphaTest packages, 2026-11-22), 5% of the bound
 * @derivation grizzle's `keyTextBytes` over the ledger's `HumanOperatorValue` and
 *   `HumanOperatorFeedback` keys `(child, package, path, n, at, rubric, asserted)`, the rubric
 *   beside a learner of 69 bytes, a name of {@link nameMaxBytes}, a path of {@link entryPathBytes},
 *   two naturals and an instant
 * @from nameMaxBytes, entryPathBytes
 */
export const literalTextBytes = 1501;

/**
 * A base value's text as a key holds it, of at most {@link literalTextBytes} UTF-8 bytes.
 */
export const LiteralText = law(entryOf("Key text bound"), str.bytes(literalTextBytes, Chars));

/**
 * Cast a lexical form a view keys into {@link LiteralText} ({@link keyedAs}): a map key or a lookup
 * value, as a base value's text is one.
 *
 * @param lexical - The lexical form, an attribute's value as the view reads it.
 * @returns It, as a key holds it.
 */
export const keyedLiteral = (lexical: TextTerm) => keyedAs(lexical, LiteralText, literalTextBytes);

/**
 * The most UTF-8 bytes of a text a query reads by a pattern, `Text.matches`: grizzle's
 * `regexTextMaxBytes`, the longest text PostgreSQL's regex engine reads. A longer one is refused,
 * a stated limit of the representation.
 */
export const matchedTextBytes = regexTextMaxBytes;

/**
 * The type of {@link matchedTextBytes}' texts: a run of XML `Char`s ({@link Chars}, a node's
 * characters folded or an attribute's value) of at most that many UTF-8 bytes.
 */
export const matchedText = law(entryOf("Key text bound"), str.bytes(matchedTextBytes, Chars));

/**
 * The most UTF-8 bytes of a decimal text a query reads by a parse, `Text.parseDecimal`:
 * grizzle's `decimalTextMaxBytes`, within which every decimal text names a value PostgreSQL's
 * numeric holds. A parse guards its own operand by it where it reads one ("Aria value range",
 * `#pantry/qti/overlay-queries/interaction.ts`), and a decimal it would read past it is refused, a
 * stated limit of the representation; no field's type is bounded by it.
 */
export { decimalTextMaxBytes as parsedDecimalBytes } from "@bjornpagen/grizzle";

/**
 * The most UTF-8 bytes a foreign element's namespace name and its local name each hold: what
 * {@link matchedTextBytes} leaves beside the `}` between them, shared evenly, since a query matches
 * the two as one text, `namespace}local` (`OpenElementName.expanded`, `#pantry/qti/chardata.ts`),
 * against its parent's name patterns. XML puts no bound on a name (reading 94), so a longer one is
 * refused as a stated limit of the representation, the regex engine's. No other name or prefix is
 * bounded: none is a text a query reads by a pattern, and no index orders by one.
 */
export const foreignNameBytes = Math.floor((matchedTextBytes - 1) / 2);

/**
 * The encoder {@link utf8Length} counts with.
 */
const utf8 = new TextEncoder();

/**
 * Count a text's UTF-8 bytes, as PostgreSQL's `octet_length` counts a text of the UTF-8 database
 * encoding grizzle requires: by the host's `TextEncoder`, never grizzle-text's `utf8Length`, which
 * grizzle's own judge counts `Text.octetLength` by. The law oracle reads this count to decide a
 * key text past its bound (`#pantry/test/oracle.ts`), and reads nothing of grizzle's packages
 * (`#pantry/grammar/purity.test.ts`), so a defect in grizzle's count is never the oracle's too.
 *
 * @param text - The text.
 * @returns Its bytes.
 */
export const utf8Length = (text: string): number => utf8.encode(text).length;

/**
 * Whether a text is a {@link LomText}, as a host reads it: a run of XML `Char`s of at most
 * {@link lomTextBytes} UTF-8 bytes. A LOM view keys no other text, so a text that is none names no
 * catalog, lesson or package a LOM view holds.
 *
 * @param text - The text.
 * @returns Whether it is one.
 */
export const isLomText = (text: string): boolean =>
  isChars(text) && utf8Length(text) <= lomTextBytes;

/**
 * The most UTF-8 bytes a published response processing template's URI holds: the longest of the
 * spellings that name one (`urisOf` of `#pantry/qti/templates.ts`, spec reading 51), the only
 * `template` values `TemplateProcessing` holds (`#pantry/qti/queries.ts`).
 */
const templateUriBytes = Math.max(...urisOf(publishedTemplates).map(utf8Length));

/**
 * A published response processing template's URI as a key holds it, of at most
 * {@link templateUriBytes} UTF-8 bytes.
 */
export const TemplateUri = law(entryOf("Key text bound"), str.bytes(templateUriBytes, Chars));

/**
 * Cast a response processing's `template` a view keys into {@link TemplateUri} ({@link keyedAs}).
 * Its guard's other arm, the empty text, is unreachable as every key text's is, by the view's own
 * filter rather than a check: the view holds a `template` only where it spells a published
 * template, each within the bound.
 *
 * @param uri - The URI, a `template`'s value as the view reads it.
 * @returns It, as a key holds it.
 */
export const keyedTemplateUri = (uri: TextTerm) => keyedAs(uri, TemplateUri, templateUriBytes);

/**
 * {@link PackageName}'s pattern as a JavaScript host reads it: with the `u` flag, so its `\u{…}`
 * escapes and supplementary characters read as code points, as PostgreSQL reads them.
 */
const packageNameForm = new RegExp(`^${ncName}$`, "u");

/**
 * Decide whether a text is a name a package can be stored under: {@link PackageName}'s language,
 * an NCName, read by the pattern the database holds `Package.name` to, of at most
 * {@link nameMaxBytes} UTF-8 bytes, so a caller's name is judged before anything reads the
 * package or opens the database, and never by a second statement of the language.
 *
 * @param name - The text.
 * @returns Whether a package can be stored under it.
 */
export const isPackageName = (name: string): boolean =>
  packageNameForm.test(name) && utf8Length(name) <= nameMaxBytes;

/**
 * The lexical form of an integer `Type.cast` reads exactly: `xs:integer`'s, within PostgreSQL's
 * signed 64-bit range, a stated limit of the representation. Spec
 * reading 46 holds a `qti-equal-rounded` `figures` to that range, so every integer AL1's lexical
 * half admits is in it, and a MathML alignment `selection` outside it counts as 0, which no child
 * has. The schema's casts (`#pantry/qti/operators.ts`, `#pantry/qti/mathml-align.ts`) and the
 * importer's reading of a selection (`#pantry/import/overlays/mathml-align.ts`) share this one
 * statement.
 */
export const integerForm = lexicalForm(pg.bigint);
