/**
 * The texts of a stored package's identity, a package's name and an entry's path, the bounds the
 * store holds a text to, and the measure and forms it reads texts by.
 *
 * A key holds a text of any length: grizzle installs a key, a containment's target and a family's
 * axes whose entry a text would outgrow over the text's image, the SHA-256 digest of its UTF-8, and
 * a lookup, a rule's probe and a seek over the texts they fix by equality by their md5, so neither
 * bounds a text here; and no ordered read orders by a name, a prefix or a path, which the host
 * orders instead, so no index holds one as itself. Each bound is PostgreSQL's, a stated limit of
 * the representation: the regex engine's, which bounds a text a query reads by a pattern
 * ({@link matchedText}), a foreign element's expanded name among them ({@link foreignNameBytes});
 * and the decimal parse's, which a parse guards its own operand by ({@link parsedDecimalBytes}).
 */
import { lexicalForm, pg, regexTextMaxBytes, str } from "@bjornpagen/grizzle";
import { anyText } from "#pantry/grammar/install.ts";

/**
 * An NCName (Namespaces in XML 1.0, §3): XML 1.0's `NameStartChar` without the colon, then its
 * `NameChar`s without the colon, each the class of the ranges XML 1.0 lists.
 *
 * @see {@link https://www.w3.org/TR/xml-names/#NT-NCName | Namespaces in XML 1.0, NCName}
 */
const ncName =
  "[A-Z_a-z\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2FF}\\u{370}-\\u{37D}\\u{37F}-\\u{1FFF}\\u{200C}-\\u{200D}\\u{2070}-\\u{218F}\\u{2C00}-\\u{2FEF}\\u{3001}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFFD}\\u{10000}-\\u{EFFFF}][\\-.0-9A-Z_a-z\\u{B7}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{37D}\\u{37F}-\\u{1FFF}\\u{200C}-\\u{200D}\\u{203F}-\\u{2040}\\u{2070}-\\u{218F}\\u{2C00}-\\u{2FEF}\\u{3001}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFFD}\\u{10000}-\\u{EFFFF}]*";

/**
 * A package's name in the store: the name its importer's caller gives it, an NCName of any length,
 * which every key, lookup and seek holds by its image wherever it would outgrow an entry as itself.
 * `Package` is keyed by it, and every row of the package holds it as its `package`, so two packages
 * are two names, and an import under a stored name replaces the package stored under it, the one
 * the caller named.
 *
 * It is no part of the package. A manifest's `identifier` (IMS Content Packaging 1.2, §6.11.4) is
 * "unique within the Manifest" alone, and its `version` "is used to distinguish between manifests
 * with the same identifier", so two packages may share an identifier, as four groups of 1EdTech's
 * example packages do: the identifier is the package's data (its `Attribute`'s `value`), never
 * its key. An NCName is an `xs:ID`'s collapsed lexical form, so a manifest identifier is a name a
 * caller may choose.
 */
export const PackageName = str.regex(`^${ncName}$`);

/**
 * A package entry's path, relative to the package root, as the package reader gives it: no leading
 * `/`, its segments `/`-separated, any other character allowed, of any length. IMS Content
 * Packaging puts no bound on an entry's path, and no index orders by one (a package's entries are
 * read as a set, `#pantry/export/scan.ts` `entriesOf`, and ordered on the host), so every index
 * holds it by its image where it would outgrow an entry as itself.
 *
 * The reader refuses an absolute path, a backslash and a `..` segment (`#pantry/package/zip.ts`,
 * `#pantry/package/read.ts`); the pattern restates none of that. A file's identity in its package:
 * `Entry`, `Document` and every row of a document hold it as their `path`, and a reference resolved
 * in the package names its target by one.
 */
export const EntryPath = str.regex("^[^/].*$", "su");

/**
 * The most UTF-8 bytes of a text a query reads by a pattern, `Text.matches`: grizzle's
 * `regexTextMaxBytes`, the longest text PostgreSQL's regex engine reads. No index bounds it: a key,
 * a lookup and a rule's probe hold a text their entry could not hold as itself by its image. A
 * longer one is refused, a stated limit of the representation.
 */
export const matchedTextBytes = regexTextMaxBytes;

/**
 * The type of {@link matchedTextBytes}' texts: any text of at most that many UTF-8 bytes.
 */
export const matchedText = str.bytes(matchedTextBytes, anyText);

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
 * an NCName, read by the pattern the database holds `Package.name` to, so a caller's name is judged
 * before anything reads the package or opens the database, and never by a second statement of the
 * language.
 *
 * @param name - The text.
 * @returns Whether a package can be stored under it.
 */
export const isPackageName = (name: string): boolean => packageNameForm.test(name);

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
