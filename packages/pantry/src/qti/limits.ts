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
import { Chars } from "#pantry/grammar/install.ts";
import { entryOf } from "#pantry/vocab/laws.ts";

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
 * `Package` is keyed by it, and every row of the package holds it as its `package`, so two packages
 * are two names, and an import under a stored name replaces the package stored under it, the one
 * the caller named.
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
 * @constraint IMS Content Packaging puts no bound on a path; a longer one is refused at import
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
 * path, so a longer one is refused at import under "Key text bound", a stated limit of the
 * representation. No index orders by one (a package's entries are read as a set,
 * `#pantry/export/scan.ts` `entriesOf`, and ordered on the host).
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
 *   refused at import
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
 * Cast a QTI identifier a view keys into {@link QtiIdentifier}, under grizzle's byte guard (README,
 * "A byte bound is a guard"). The guard's other arm, the empty text, is unreachable in every
 * committed state: each view that keys one states "Key text bound" over the very texts it casts
 * (`DeclaredIdentifierText` of `#pantry/qti/names.ts` for a declaration's identifier,
 * `TestIdentifierText` of `#pantry/qti/overlay-queries/tests.ts` for a test's), which refuses at
 * its import a package that holds one past {@link identifierBytes}, by name. A view that keys an
 * identifier its check does not cover is a defect of that view, never a value of the empty text.
 *
 * @param identifier - The identifier, an attribute's value as the view reads it.
 * @returns It, as a key holds it.
 */
export const keyedIdentifier = (identifier: TextTerm) =>
  Logic.when(
    Num.within(Text.octetLength(identifier), 0, identifierBytes),
    () => Type.cast(identifier, QtiIdentifier),
    Type.literal(QtiIdentifier, ""),
  );

/**
 * The most UTF-8 bytes a matched text a key holds: a LOM term's catalog, entry, source or id, and a
 * numbered reading's number, what one B-tree entry leaves it in `NumberedReading`'s key beside two
 * paths.
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one such text in any key or index grizzle builds over it
 * @constraint LOM and QTI put no bound on these texts; a longer numbered reading's number is refused
 *   at import, and a longer LOM text is left out of the typed LOM view that keys it
 *   ({@link fitsKeyMatchedText}), never refused
 * @derivation grizzle's `keyTextBytes` over `NumberedReading`'s key `(package, assembly, path,
 *   start, attribute, scopeInstance, scope, number)`, the number beside a name of
 *   {@link nameMaxBytes}, two paths of {@link entryPathBytes}, three naturals and a code; the QTI
 *   database's `ItemSet` `(purpose, source, id, package, path)` and `History` `(catalog, entry,
 *   package, earlier)` leave it more
 * @from nameMaxBytes, entryPathBytes
 */
export const keyMatchedTextBytes = 777;

/**
 * A matched text as a key holds it, of at most {@link keyMatchedTextBytes} UTF-8 bytes.
 */
export const KeyMatchedText = law(entryOf("Key text bound"), str.bytes(keyMatchedTextBytes, Chars));

/**
 * Whether a LOM text fits {@link KeyMatchedText}: at most {@link keyMatchedTextBytes} UTF-8 bytes.
 * A typed LOM view keeps a catalog, entry, taxon source or taxon id only where it fits
 * (`#pantry/qti/lom.ts`), since LOM bounds none of them and an importer may "ignore or remove the
 * unsupported data" (QTI 3.0 Conformance §3), never refuse it.
 *
 * @param text - The text, a node's string value as the view reads it.
 * @returns Whether it fits.
 */
export const fitsKeyMatchedText = (text: TextTerm) =>
  Logic.le(Text.octetLength(text), keyMatchedTextBytes);

/**
 * Cast a LOM text a view keys into {@link KeyMatchedText}, under grizzle's byte guard. The guard's
 * other arm, the empty text, is unreachable: the view keeps the text only where it fits
 * ({@link fitsKeyMatchedText}).
 *
 * @param text - The text, a node's string value as the view reads it.
 * @returns It, as a key holds it.
 */
export const keyedMatchedText = (text: TextTerm) =>
  Logic.when(
    Num.within(Text.octetLength(text), 0, keyMatchedTextBytes),
    () => Type.cast(text, KeyMatchedText),
    Type.literal(KeyMatchedText, ""),
  );

/**
 * The most UTF-8 bytes a namespace name, a URI, holds in a key: what one B-tree entry leaves it in
 * `OpenAttributeEntity`'s key beside a path and a local name.
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one namespace name or URI in any key or index grizzle builds over it
 * @constraint Namespaces in XML and RFC 3986 put no bound on a URI; a longer one is refused at import
 * @derivation grizzle's `keyTextBytes` over `OpenAttributeEntity`'s key `(package, path, start,
 *   uri, local, offset)`, the URI and the local name sharing what a name of {@link nameMaxBytes}
 *   and a path of {@link entryPathBytes} leave, the local name {@link xmlNameBytes}; the ledger's
 *   URI response keys fit it too
 * @from nameMaxBytes, entryPathBytes
 */
export const uriBytes = 792;

/**
 * A namespace name or URI as a key holds it, of at most {@link uriBytes} UTF-8 bytes.
 */
export const UriText = law(entryOf("Key text bound"), str.bytes(uriBytes, Chars));

/**
 * The most UTF-8 bytes an XML name holds in a key, a local name or a namespace prefix: what
 * `OpenAttributeEntity`'s key leaves it beside a URI of {@link uriBytes}.
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one local name or prefix in any key or index grizzle builds over it
 * @constraint Namespaces in XML puts no bound on a name; a longer one is refused at import
 * @derivation grizzle's `keyTextBytes` over `OpenAttributeEntity`'s key `(package, path, start,
 *   uri, local, offset)` beside a URI of {@link uriBytes}, a name of {@link nameMaxBytes} and a path
 *   of {@link entryPathBytes}; a prefix's own key, `Namespace`'s, would leave it more, and takes
 *   the one bound of XML names
 * @from nameMaxBytes, entryPathBytes, uriBytes
 */
export const xmlNameBytes = 793;

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
 * @constraint QTI puts no bound on a base value; a longer one is refused at import
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
 * The most UTF-8 bytes a `data-ssml` member's name holds: what one B-tree entry leaves it in the
 * reference target `DataSsmlMember (package, path, start, at, member)` and `DataSsmlProperty`'s
 * lookup `(package, path, start, member, name)`.
 *
 * @limitKind derived
 * @owner PostgreSQL 19's B-tree entry limit (BTMaxItemSize, 2,704 B at 8 kB blocks)
 * @unit UTF-8 bytes
 * @scope one `data-ssml` member's name in any key or index grizzle builds over it
 * @constraint QTI puts no bound on a member's name; a longer one is refused at import
 * @derivation grizzle's `keyTextBytes` over `DataSsmlProperty`'s lookup `(package, path, start,
 *   member, name)`, the name beside a name of {@link nameMaxBytes} and a path of
 *   {@link entryPathBytes}
 * @from nameMaxBytes, entryPathBytes
 */
export const ssmlMemberBytes = 1592;

/**
 * A `data-ssml` member's name as a key holds it, of at most {@link ssmlMemberBytes} UTF-8 bytes.
 */
export const SsmlMemberText = law(entryOf("Key text bound"), str.bytes(ssmlMemberBytes, Chars));

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
