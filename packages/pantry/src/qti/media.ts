/**
 * The package-media level, `QtiMedia`: the laws an application stacks over `Qti` with grizzle's
 * `schema.extend`, so the database refuses a fetch of anything but a file of the package whose
 * extension the application's policy lists, and pantry's importer states nothing of them. The
 * policy is data, the rows of {@link MediaType}, each extension a player may fetch with the media
 * type the application serves its files with, which the application writes as its own rows. A
 * player fetches each such file from wherever the application serves the package's files, by its
 * media digest (`Media.digest`), with the media type the policy gives its extension, and holds no
 * file nothing names.
 *
 * A level reaches the relations below it through a query or a row check (README, "Levels"). A law
 * of one row alone (Media data, Media style and Media path on `Attribute`, `Node`, `Reference` and
 * `TextReference`, Media entity on `Attribute`, `Node` and `Doctype`, Media foreign on
 * `OpenAttribute` and `Node`) is a row check over that relation
 * of `Qti`, reading its text with `Compute.matches` as `Attribute`'s own checks do, whatever its
 * length, and installs as a CHECK on the relation's table, named by the check, in an installation
 * that holds this level and in no other. Every other law reads more than one row, and is a rule
 * over a derived relation of `QtiMedia` that reads `Qti`'s tables, which deferred triggers judge at
 * commit (README, "Rules over queries"); a query reads a text by `Compute.matches` only within a
 * byte bound its type states. Every writer meets them all. A refusal
 * by one is the law's own to a login over `QtiMedia`, and to a login over `Qti` the first law of an
 * `above` refusal, grizzle's `{ kind: "above", level: "QtiMedia", law }`, with no witness, since
 * that login's host holds none of the level's predicates; a row check's comes beside every law of
 * `Qti`'s own the first stated row breaks, each with that row's key as `every` names them
 * (grizzle's `refused.own`). It names its law and rule either way (`lawNameOf` of
 * `#pantry/import/refusal.ts`).
 *
 * - **Media path** (rule `media-path`): every address a player fetches, each field
 *   `#pantry/vocab/fetched.ts` declares, names a file of the package, which `file-exists` holds to
 *   an `Entry`:
 *
 *   - An attribute fetched under any governor of its kind's type ({@link governorsOf}) is one the
 *     reference census resolves (`ReferenceAttribute`), and the text of a fetched element is one the
 *     text census resolves (`textReferenceKinds` of `#pantry/grammar/references.ts`), so the import
 *     writes it a `Reference` or a `TextReference`;
 *   - That reference resolved in the package (its `HrefScope` is `entry`), so it has its
 *     `ReferencePath` or `TextReferencePath`: no external address, none above the package's root or
 *     under an `xml:base` outside it, and no same-document reference (an empty one, a query or a
 *     fragment alone);
 *   - Its value holds no scheme, `data:` among them, and starts with no `/` or `\`, an absolute path or
 *     a network path's `//` authority, as the URL Standard reads it ({@link nonRelative}).
 *
 *   So it refuses, whatever they hold, the fetched fields no census resolves: the text of a
 *   `qti-file-href` other than a card's (a calculator's or a digital material's), which the
 *   information model does not hold to the package; and an attribute fetched under the governor of
 *   another kind's type (a `qti-null` governed by `ImgDType`), since the census reads an element by
 *   its kind. None of them names an entry a law can hold, so none could be served as a file of the
 *   package. A `qti-interaction-module`'s `primary-path` and `fallback-path` are census attributes,
 *   each naming the file the loader loads, its path against the package's root with `.js` appended
 *   (spec reading 201), so a module the package holds is served as its `.js` file.
 * - **Media type** (rule `media-type`): every entry a fetched reference resolves to has an extension
 *   a {@link MediaType} row lists: the text after the last `.` of its path's last segment, where
 *   that `.` is not the segment's first character, as Node's `path.posix.extname` reads that
 *   segment ({@link extensionPattern}), so a path that ends with `/` has none; matched
 *   case-sensitively, so `photo.JPG` and `photo.jpeg` are refused under a policy that lists `jpg`.
 *   The law reads the reference's resolved path, which `file-exists` holds to be the entry's own.
 * - **Media data** (rule `media-data`): no address uses the `data:` scheme, so no value carries a
 *   base64 payload: no admitted attribute and no element text whose domain is an `xs:anyURI`, links
 *   and identifiers included, as the URL Standard reads its scheme ({@link dataScheme}), and no
 *   token of an address list (`xsi:schemaLocation`). A `source`'s `src` and `srcset`, a `video`'s
 *   `poster` and an `object`'s `data` are fetched fields typed as strings rather than `xs:anyURI`
 *   (`URLDType`, `xs:normalizedString`), and Media path refuses a scheme in every fetched field,
 *   `data:` among them.
 * - **Media style** (rule `media-style`): no `style` attribute holds `url(`, `@import`, `image-set(`
 *   or `src(`, in any case, or a backslash, which begins a CSS escape ({@link styleFetch}).
 * - **Media entity** (rule `media-entity`): nothing a player fetches by depends on an entity's
 *   replacement text the database never read. crust keeps an entity reference unexpanded only where
 *   the entity's declaration may sit where it reads none, an external subset or a parameter entity
 *   of the internal subset (XML 1.0 §4.4), while a player that reads the subset expands it, so the
 *   kept form may hide an address: a `srcset`'s `1x&e;` passes as one candidate here and is a
 *   second, off-package candidate there, as a `style`'s `&e;` may be its `url(`. So no fetched
 *   attribute (under a governor of a kind that fetches it), no address list's attribute and no
 *   `style` keeps an entity reference (no `AttributeEntity` is of it, {@link EntityAttribute}), no
 *   fetched text holds one (an `entityRef` node under a fetched text's governor), and no document
 *   type declaration names an external identifier, an external subset's or an entity's or a
 *   notation's ({@link externalIdentifier}): a player that reads the declaration fetches each from
 *   an address no law holds, and applies what it declares (entities, attribute defaults) to content
 *   the database judged without it (XML 1.0 §2.8, §4.2.2, §5.1).
 * - **Media foreign** (rule `media-foreign`): no markup pantry keeps but cannot interpret, which
 *   could carry an address no law above reads: no foreign element, of any of the three namespace
 *   classes (`foreignKinds` of `#pantry/grammar/kinds.ts`), and no attribute of an open class but
 *   `data-*` (an `OpenAttribute` of any other class), so no `foreign`, `no-namespace` or
 *   `own-namespace` attribute. A `data-*` attribute is kept, as QTI writes them
 *   (`data-catalog-idref`).
 * - **Entry used** (rule `entry-used`): every entry is the manifest, a document (`Document`), or the
 *   path a reference resolves to in the package (`ReferencePath`) or a text reference does
 *   (`TextReferencePath`). "File exists" holds every resolved path to an entry, so the package's
 *   files and what its documents name match one to one, and a file nothing names, a stray schema or
 *   an unused picture, is refused, naming the law. It is a check over {@link UnusedEntry}, the
 *   entries no document and no resolved reference names, which holds each to be the manifest, so a
 *   refused import names it by its check's name as it names every law of the policy. It is the
 *   policy's and not `Qti`'s own: IMS Content Packaging 1.2 has every file a manifest or a document
 *   names be in the package, never the reverse, and QTI packages list files no document references
 *   (the 1EdTech examples list their XSDs and unused media), so this package's own install keeps
 *   them, as the spec readings read the specifications. An install that serves only what its items
 *   name states it, and imports only what it serves.
 *
 * The laws read only the fields `#pantry/vocab/fetched.ts` declares, but Entry used: a manifest's
 * `href`, an item, section or stimulus ref's, an `xi:include`'s, a link's and every other reference
 * that names a document rather than fetched media stays `file-exists`'s alone, whatever its
 * extension, and Entry used reads every resolved reference.
 *
 * Every check is named by its law with spaces written as underscores, as every check of the schema
 * is (`#pantry/import/refusal.ts` `checkNameOf`).
 *
 * @see {@link https://url.spec.whatwg.org/#concept-basic-url-parser | URL Standard, the basic URL parser}
 * @see {@link https://nodejs.org/api/path.html#pathextnamepath | Node.js, path.extname}
 */
import {
  check,
  Compute,
  derived,
  generated,
  key,
  login,
  on,
  query,
  relation,
  role,
  schema,
  str,
  v,
  wholeEntriesOf,
  workload,
} from "@bjornpagen/grizzle";
import { Array as Arr, Option } from "effect";
import {
  AttributeGrammar,
  AttributeModelOf,
  grammar,
  TextDomain,
} from "#pantry/grammar/install.ts";
import { foreignKinds, openClasses } from "#pantry/grammar/kinds.ts";
import { textReferenceKinds } from "#pantry/grammar/references.ts";
import { Attribute, AttributeEntity, OpenAttribute } from "#pantry/qti/attributes.ts";
import { Doctype, Document } from "#pantry/qti/chardata.ts";
import { authorReads, authorWrites, insertWrite, removeWrite } from "#pantry/qti/logins.ts";
import { Node } from "#pantry/qti/node.ts";
import { SrcsetForm } from "#pantry/qti/overlay-queries/package.ts";
import {
  CandidatePath,
  Entry,
  Reference,
  ReferencePath,
  SrcsetCandidate,
  TextReference,
  TextReferencePath,
} from "#pantry/qti/package.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { addressLists, fetchedAttributes, fetchedTexts } from "#pantry/vocab/fetched.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";

/**
 * The characters the URL Standard strips before a URL, the C0 controls and the space, as the body
 * of a character class. NUL is left out: no XML document holds it, and grizzle admits no pattern
 * that does.
 *
 * @see {@link https://url.spec.whatwg.org/#c0-control | URL Standard, C0 control}
 */
const leadingStripped = String.raw`\u{1}-\u{20}`;

/**
 * The ASCII tab and newline the URL Standard removes from anywhere in a URL, as the body of a
 * character class.
 *
 * @see {@link https://url.spec.whatwg.org/#ascii-tab-or-newline | URL Standard, ASCII tab or newline}
 */
const tabOrNewline = String.raw`\t\n\r`;

/**
 * An address that uses the `data:` scheme, as the URL Standard reads a scheme: past the leading C0
 * controls and spaces it strips, the letters `data` in any case, any tab or newline among them
 * removed, and the colon that ends a scheme.
 *
 * @see {@link https://url.spec.whatwg.org/#scheme-state | URL Standard, scheme state}
 */
const dataScheme = Compute.pattern<string>(
  `^[${leadingStripped}]*[dD][${tabOrNewline}]*[aA][${tabOrNewline}]*[tT][${tabOrNewline}]*[aA][${tabOrNewline}]*:`,
);

/**
 * A token of an address list that uses the `data:` scheme: at the list's start or after the
 * whitespace that separates its tokens, which a token never holds.
 *
 * @see {@link https://www.w3.org/TR/xmlschema-2/#atomic-vs-list | XML Schema 1.0 Part 2, §2.5.1.2 List datatypes}
 */
const dataToken = Compute.pattern<string>(
  `(?:^|[${tabOrNewline} ])[${leadingStripped}]*[dD][aA][tT][aA]:`,
);

/**
 * A style that makes the player fetch, or could spell a fetch past this pattern, in any case: CSS's
 * `url(`, an `@import`, `image-set(` (`-webkit-image-set(` among them) and `src(`, each of which
 * takes an address as a plain string, and any backslash, which begins a CSS escape, so no escaped
 * spelling such as `\75 rl(` names a function the pattern does not read.
 *
 * @see {@link https://www.w3.org/TR/css-syntax-3/#consume-escaped-code-point | CSS Syntax 3, consume an escaped code point}
 * @see {@link https://www.w3.org/TR/css-images-4/#image-set-notation | CSS Images 4, image-set()}
 * @see {@link https://www.w3.org/TR/css-values-4/#urls | CSS Values 4, src()}
 */
const styleFetch = Compute.pattern(
  String.raw`[uU][rR][lL]\(|@[iI][mM][pP][oO][rR][tT]|[iI][mM][aA][gG][eE]-[sS][eE][tT]\(|[sS][rR][cC]\(|\\`,
);

/**
 * A document type declaration that names an external identifier, anything a player that reads the
 * declaration fetches: the external subset's, an external entity's, an unparsed entity's or a
 * notation's, each its keyword, `SYSTEM` or `PUBLIC`, after white space and before the white space
 * and quote that open its literal. A literal or a comment of the internal subset that spells one is
 * refused too, which the policy accepts for markup a QTI package has no need of.
 *
 * @see {@link https://www.w3.org/TR/xml/#NT-doctypedecl | XML 1.0, doctypedecl}
 * @see {@link https://www.w3.org/TR/xml/#NT-ExternalID | XML 1.0, ExternalID}
 * @see {@link https://www.w3.org/TR/xml/#NT-NotationDecl | XML 1.0, NotationDecl}
 */
const externalIdentifier = Compute.pattern<string>(
  `[${tabOrNewline} ](?:SYSTEM|PUBLIC)[${tabOrNewline} ]+["']`,
);

/**
 * An address that is no path relative to its document, as the URL Standard reads one against the
 * player's page: past the leading C0 controls and spaces it strips, a scheme (an ASCII letter, then
 * letters, digits, `+`, `-` and `.`, any tab or newline among them removed, then the colon that
 * ends it), `data:` among them; or a first `/` or `\`, which the URL Standard reads alike for a
 * special scheme's URL, the start of an absolute path or, doubled, of a network path's authority.
 *
 * @see {@link https://url.spec.whatwg.org/#scheme-start-state | URL Standard, scheme start state}
 * @see {@link https://url.spec.whatwg.org/#relative-state | URL Standard, relative state}
 */
const nonRelative = Compute.pattern<string>(
  `^[${leadingStripped}]*(?:[A-Za-z][A-Za-z0-9+.\\-${tabOrNewline}]*:|[/\\\\])`,
);

/**
 * A path with an extension, as Node's `path.posix.extname` reads one in its last segment: a `.` in
 * that segment, not its first character, followed by at least one character, none a `.` or a `/`.
 * The extension is what follows that `.`.
 *
 * @see {@link https://nodejs.org/api/path.html#pathextnamepath | Node.js, path.extname}
 */
const extensionPattern = Compute.pattern<string>(String.raw`[^/]\.[^./]+$`);

/**
 * The governors an element kind's attributes and text are read under: the kind itself, and every
 * governor whose type is the kind's declared type, as an `xsi:type` naming that type makes it
 * govern an element of another kind (`Governor` of `#pantry/grammar/install.ts`).
 *
 * @param kinds - The element kinds.
 * @returns Their governors, each once.
 */
const governorsOf = (kinds: readonly string[]): readonly string[] => {
  const types = new Set(kinds.flatMap((kind) => Option.toArray(grammar.xsi.declaredType(kind))));

  return Arr.dedupe([
    ...kinds,
    ...grammar.attributes.governor.rows.flatMap(({ governor, governs }) =>
      types.has(governs) ? [governor] : [],
    ),
  ]);
};

/**
 * The fetched attributes by name, each with the governors of every kind that fetches it.
 */
const fetchedNames = Object.values(Arr.groupBy(fetchedAttributes, ({ name }) => name)).map(
  (rows) => ({ governors: governorsOf(rows.map(({ kind }) => kind)), name: rows[0].name }),
);

/**
 * The governors whose text a player fetches.
 */
const textGovernors = governorsOf(fetchedTexts);

/**
 * The fetched element kinds whose text the text census resolves: the only ones whose text the
 * import writes a `TextReference` of.
 */
const resolvedTextKinds = fetchedTexts.filter((kind) =>
  textReferenceKinds.some((resolved) => resolved.kind === kind),
);

/**
 * The value domains that are an `xs:anyURI`'s: every domain whose primitive is `anyURI`.
 */
const uriDomains = grammar.attributes.valueDomain.rows.flatMap(({ domain, primitive }) =>
  primitive === "anyURI" ? [domain] : [],
);

/**
 * The open attribute classes Media foreign refuses: every class but `data-*`.
 */
const uninterpretedClasses = openClasses.filter((name) => name !== "data-*");

/**
 * A file extension a policy lists: lowercase ASCII letters and digits, without its dot, as an
 * entry's path writes it after its last `.` (`photo.jpg` is `jpg`). An extension matches as
 * written, so a policy lists one spelling of each and a path in another case is refused.
 */
const MediaExtension = str.regex("^[a-z0-9]{1,127}$");

/**
 * The media type a policy serves an extension's files with, as an HTTP `Content-Type` names it: a
 * type and a subtype, each a restricted name (RFC 6838, §4.2), in lower case, the form the registry
 * writes, with no parameter.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6838#section-4.2 | RFC 6838, §4.2 Naming Requirements}
 */
const MediaTypeName = str.regex(
  "^[a-z0-9][a-z0-9!#$&^_.+-]{0,126}/[a-z0-9][a-z0-9!#$&^_.+-]{0,126}$",
);

/**
 * An extension with its dot before it, as a path ends with it.
 */
const Suffix = str.regex("^[.][a-z0-9]{1,127}$");

/**
 * The application's media policy, one row per extension a player may fetch: the extension, the
 * media type the application serves its files with, and `suffix`, the extension with its dot, as a
 * path ends with it, which PostgreSQL generates. Each media type is listed under one extension, its
 * one spelling ("Media type", a key on `type`): a policy that lists `jpg` for `image/jpeg` lists no
 * `jpeg`. A policy of no row admits no fetched entry at all.
 */
export const MediaType = relation.generated(
  "MediaType",
  { extension: MediaExtension, type: MediaTypeName },
  ["extension"],
  (m) => ({
    suffix: generated(
      Suffix,
      Compute.concat(Compute.literal(str.regex("^[.]$"), "."), m.extension),
    ),
  }),
);

/**
 * The policy's level over `Qti`: {@link MediaType}, the rows the level's rules read, a level of its
 * own since a derived relation reads only the levels below its own.
 *
 * An application writes these rows through a role of their own, one that writes nothing its READ
 * COMMITTED readers read. The media laws read `MediaType`, so a role writing it beside relations a
 * reader reads gives grizzle's certifier another writer of that reader's reads, and it lifts the
 * reader to SERIALIZABLE (found by edullm: a publisher that also wrote the policy moved its
 * learner).
 */
export const QtiMediaPolicy = schema.extend(
  Qti,
  "QtiMediaPolicy",
  [MediaType],
  [key(on(MediaType, "type"))],
);

/**
 * Every attribute no {@link Reference} and no `Srcset` is of, by its element's place and its name,
 * with its governor: Media path holds each to be no fetched attribute, since the import writes a
 * reference for every attribute the reference census resolves as one URI, and a `Srcset` for every
 * one it reads as image candidates, whose attribute is its {@link SrcsetForm}'s. A fetched field is
 * a closed name, so no `OpenAttribute` is one.
 */
const UnreferencedAttribute = derived(
  "UnreferencedAttribute",
  query(Qti).rule((r) => {
    const { governor, name, package: pkg, path, start } = v(Attribute, "attribute");

    return r
      .match(Attribute, { governor, name, package: pkg, path, start })
      .where(r.not(Reference, { name, package: pkg, path, start }))
      .where(r.not(SrcsetForm, { name, package: pkg, path, start }))
      .find({ governor, name, package: pkg, path, start });
  }),
);

/**
 * Every closed attribute that keeps an unexpanded entity reference, by its element's place and its
 * name, with its governor: Media entity holds each to be no `style`, no address list's attribute
 * and no fetched attribute under a governor that fetches it. An attribute of several references is
 * one row.
 */
const EntityAttribute = derived(
  "EntityAttribute",
  query(Qti).rule((r) => {
    const { governor, name, package: pkg, path, start } = v(Attribute, "attribute");

    return r
      .match(AttributeEntity, { name, package: pkg, path, start })
      .match(Attribute, { governor, name, package: pkg, path, start })
      .find({ governor, name, package: pkg, path, start });
  }),
);

/**
 * Every image candidate of a `srcset`, by its element's place, its attribute's name and its index,
 * with its element's kind, its URL and its outcome's scope, which Media path reads as it reads a
 * `Reference`: it reads the `srcset`'s {@link SrcsetForm} too, for the attribute's kind and name,
 * so its law is a rule over this relation rather than a row check.
 */
const MediaCandidate = derived(
  "MediaCandidate",
  query(Qti).rule((r) => {
    const { at, package: pkg, path, scope, start, url } = v(SrcsetCandidate, "candidate");
    const { kind, name } = v(SrcsetForm, "srcset");

    return r
      .match(SrcsetCandidate, { at, package: pkg, path, scope, start, url })
      .match(SrcsetForm, { kind, name, package: pkg, path, start })
      .find({ at, kind, name, package: pkg, path, scope, start, url });
  }),
);

/**
 * The resolved references, by the reference's element's place and its name, whose target's
 * extension a {@link MediaType} row lists: a path with an extension ({@link extensionPattern}) that
 * ends with the row's suffix.
 */
const servedPaths = query(QtiMediaPolicy).rule((r) => {
  const { name, package: pkg, path, start, target } = v(ReferencePath, "path");
  const { suffix } = v(MediaType, "media");

  return (
    r
      .match(ReferencePath, { name, package: pkg, path, start, target })
      .match(MediaType, { suffix })
      .where(Compute.matches(target, extensionPattern))
      // GRIZZLE-PENDING: a boolean term as a predicate
      .where(Compute.eq(Compute.endsWith(target, suffix), true))
      .find({ name, package: pkg, path, start })
  );
});

/**
 * Every resolved reference whose target no {@link MediaType} row serves, by the reference's
 * element's place and its name, with the reference's kind: Media type holds each to be no fetched
 * reference's.
 */
const UnservedPath = derived(
  "UnservedPath",
  query(QtiMediaPolicy).rule((r) => {
    const { kind, name, package: pkg, path, start } = v(ReferencePath, "path");

    return r
      .match(ReferencePath, { kind, name, package: pkg, path, start })
      .where(r.not(servedPaths, { name, package: pkg, path, start }))
      .find({ kind, name, package: pkg, path, start });
  }),
);

/**
 * The image candidates resolved in the package, by the candidate's element's place and index,
 * whose target's extension a {@link MediaType} row lists, as {@link servedPaths} reads a
 * reference's.
 */
const servedCandidatePaths = query(QtiMediaPolicy).rule((r) => {
  const { at, package: pkg, path, start, target } = v(CandidatePath, "path");
  const { suffix } = v(MediaType, "media");

  return r
    .match(CandidatePath, { at, package: pkg, path, start, target })
    .match(MediaType, { suffix })
    .where(Compute.matches(target, extensionPattern))
    .where(Compute.eq(Compute.endsWith(target, suffix), true))
    .find({ at, package: pkg, path, start });
});

/**
 * Every image candidate resolved in the package whose target no {@link MediaType} row serves, by
 * the candidate's element's place and index, with its element's kind and its attribute's name:
 * Media type holds each to be no fetched attribute's.
 */
const UnservedCandidatePath = derived(
  "UnservedCandidatePath",
  query(QtiMediaPolicy).rule((r) => {
    const { at, package: pkg, path, start } = v(CandidatePath, "path");
    const { kind, name } = v(SrcsetForm, "srcset");

    return r
      .match(CandidatePath, { at, package: pkg, path, start })
      .match(SrcsetForm, { kind, name, package: pkg, path, start })
      .where(r.not(servedCandidatePaths, { at, package: pkg, path, start }))
      .find({ at, kind, name, package: pkg, path, start });
  }),
);

/**
 * The resolved text references, by the text reference's element's place, whose target's extension
 * a {@link MediaType} row lists.
 */
const servedTextPaths = query(QtiMediaPolicy).rule((r) => {
  const { package: pkg, path, start, target } = v(TextReferencePath, "path");
  const { suffix } = v(MediaType, "media");

  return r
    .match(TextReferencePath, { package: pkg, path, start, target })
    .match(MediaType, { suffix })
    .where(Compute.matches(target, extensionPattern))
    .where(Compute.eq(Compute.endsWith(target, suffix), true))
    .find({ package: pkg, path, start });
});

/**
 * Every resolved text reference whose target no {@link MediaType} row serves, by the text
 * reference's element's place, with its kind: Media type holds each to be no fetched text's.
 */
const UnservedTextPath = derived(
  "UnservedTextPath",
  query(QtiMediaPolicy).rule((r) => {
    const { kind, package: pkg, path, start } = v(TextReferencePath, "path");

    return r
      .match(TextReferencePath, { kind, package: pkg, path, start })
      .where(r.not(servedTextPaths, { package: pkg, path, start }))
      .find({ kind, package: pkg, path, start });
  }),
);

/**
 * The entries no document is at and no reference resolves to, by package and path: no `Document` at
 * the entry's path, and no `ReferencePath`, `TextReferencePath` or `CandidatePath` whose `target`
 * it is. Each negation is a filter of its own.
 */
const UnusedEntry = derived(
  "UnusedEntry",
  query(Qti).rule((r) => {
    const { package: pkg, path } = v(Entry, "entry");

    return r
      .match(Entry, { package: pkg, path })
      .where(r.not(Document, { package: pkg, path }))
      .where(r.not(ReferencePath, { package: pkg, target: path }))
      .where(r.not(TextReferencePath, { package: pkg, target: path }))
      .where(r.not(CandidatePath, { package: pkg, target: path }))
      .find({ package: pkg, path });
  }),
);

/**
 * The level's laws by name, the module's header giving each. Every check is named by its law with
 * spaces written as underscores, as every check of the schema is (`checkNameOf` of
 * `#pantry/import/refusal.ts`).
 */
export const mediaLawsByName = {
  "Entry used": [check("Entry_used", UnusedEntry, (u) => u.eq(u.path, manifestPath))],
  "Media data": [
    check("Media_data", Attribute, (a) =>
      a.and(
        a.or(
          a.not(
            a.eq(
              Compute.subset(
                Compute.singleton(a.name),
                AttributeGrammar.row(AttributeModelOf.at("model", a.governor)),
              ),
              true,
            ),
          ),
          a.not(
            a.in(
              AttributeGrammar.at("domain", AttributeModelOf.at("model", a.governor), a.name),
              uriDomains,
            ),
          ),
          a.not(Compute.matches(a.lexical, dataScheme)),
        ),
        a.or(a.not(a.in(a.name, addressLists)), a.not(Compute.matches(a.lexical, dataToken))),
      ),
    ),
    check("Media_data", Node, (n) =>
      n.or(
        n.not(
          n.and(TextDomain.has(n.governor), n.in(TextDomain.at("domain", n.governor), uriDomains)),
        ),
        n.not(Compute.matches(n.stringValue, dataScheme)),
      ),
    ),
  ],
  "Media entity": [
    check("Media_entity", EntityAttribute, (a) =>
      a.not(
        a.or(
          a.eq(a.name, "style"),
          a.in(a.name, addressLists),
          ...fetchedNames.map(({ governors, name }) =>
            a.and(a.eq(a.name, name), a.in(a.governor, governors)),
          ),
        ),
      ),
    ),
    check("Media_entity", Node, (n) =>
      n.or(n.ne(n.kind, "entityRef"), n.not(n.in(n.parentGovernor, textGovernors))),
    ),
    check("Media_entity", Doctype, (d) => d.not(Compute.matches(d.value, externalIdentifier))),
  ],
  "Media foreign": [
    check("Media_foreign", OpenAttribute, (a) => a.not(a.in(a.class, uninterpretedClasses))),
    check("Media_foreign", Node, (n) => n.not(n.in(n.kind, Object.values(foreignKinds)))),
  ],
  "Media path": [
    check("Media_path", UnreferencedAttribute, (a) =>
      a.not(
        a.or(
          ...fetchedNames.map(({ governors, name }) =>
            a.and(a.eq(a.name, name), a.in(a.governor, governors)),
          ),
        ),
      ),
    ),
    check("Media_path", Reference, (r) =>
      r.or(
        r.not(
          r.or(
            ...fetchedAttributes.map(({ kind, name }) =>
              r.and(r.eq(r.kind, kind), r.eq(r.name, name)),
            ),
          ),
        ),
        // The attribute's form is `lead ‖ target ‖ params ‖ trail` ("E1 derived"): `lead` is
        // whitespace the pattern's leading run strips, and a scheme or a first `/` or `\` begins
        // and ends in `target`, since `params` is empty or begins with `?` or `#` and `trail` is
        // whitespace, so the form is relative exactly where its target is.
        r.and(r.eq(r.scope, "entry"), r.not(Compute.matches(r.target, nonRelative))),
      ),
    ),
    check("Media_path", Node, (n) =>
      n.or(
        n.not(n.in(n.governor, textGovernors)),
        n.and(n.in(n.kind, resolvedTextKinds), n.not(Compute.matches(n.stringValue, nonRelative))),
      ),
    ),
    check("Media_path", TextReference, (r) =>
      r.or(r.not(r.in(r.kind, fetchedTexts)), r.eq(r.scope, "entry")),
    ),
    check("Media_path", MediaCandidate, (c) =>
      c.or(
        c.not(
          c.or(
            ...fetchedAttributes.map(({ kind, name }) =>
              c.and(c.eq(c.kind, kind), c.eq(c.name, name)),
            ),
          ),
        ),
        c.and(c.eq(c.scope, "entry"), c.not(Compute.matches(c.url, nonRelative))),
      ),
    ),
  ],
  "Media style": [
    check("Media_style", Attribute, (a) =>
      a.or(a.not(a.eq(a.name, "style")), a.not(Compute.matches(a.lexical, styleFetch))),
    ),
  ],
  "Media type": [
    check("Media_type", UnservedPath, (p) =>
      p.not(
        p.or(
          ...fetchedAttributes.map(({ kind, name }) =>
            p.and(p.eq(p.kind, kind), p.eq(p.name, name)),
          ),
        ),
      ),
    ),
    check("Media_type", UnservedTextPath, (p) => p.not(p.in(p.kind, fetchedTexts))),
    check("Media_type", UnservedCandidatePath, (p) =>
      p.not(
        p.or(
          ...fetchedAttributes.map(({ kind, name }) =>
            p.and(p.eq(p.kind, kind), p.eq(p.name, name)),
          ),
        ),
      ),
    ),
  ],
} as const;

/**
 * The package-media level over {@link QtiMediaPolicy}: every derived relation its rules read, and
 * the laws, the row checks over `Attribute`, `OpenAttribute`, `Node`, `Doctype`, `Reference` and
 * `TextReference` among them. An application lists
 * it, or a level of its own over it, in its grizzle config's `schemas`, so the installation holds
 * `Qti`, the policy and these laws, and writes its policy as {@link MediaType} rows.
 */
export const QtiMedia = schema.extend(
  QtiMediaPolicy,
  "QtiMedia",
  [
    EntityAttribute,
    MediaCandidate,
    UnreferencedAttribute,
    UnservedCandidatePath,
    UnservedPath,
    UnservedTextPath,
    UnusedEntry,
  ],
  Object.values(mediaLawsByName).flat(),
);

/**
 * The author role over {@link QtiMedia}, for an application whose author login is over the media
 * level: it holds every stored relation and roster of the installation whole, the policy's and the
 * level's derived relations among them (grizzle's `wholeEntriesOf`), and writes `Qti`'s stored
 * relations (`authorWrites` of `#pantry/qti/logins.ts`), as `Author` of `#pantry/qti/roles.ts`
 * does, and no relation of the policy: {@link MediaType} is written through a role of its own, one
 * that writes nothing a READ COMMITTED reader reads ({@link QtiMediaPolicy}). grizzle's `write`
 * grants SELECT, INSERT and DELETE on each table it names, and no UPDATE, since no relation of
 * `Qti` is mutable: a package is published whole (`insertWrite`) and removed whole
 * (`removeWrite`), never changed.
 *
 * Over `QtiMedia`, a refusal by a media law is the law's own, `every` with the row's key as its
 * witness where the host judges the row; over `Qti`, it is `{ kind: "above", level: "QtiMedia",
 * law }`, and a row check's comes `first` with no witness. pantry names both alike
 * (`lawNameOf` of `#pantry/import/refusal.ts`).
 */
export const MediaAuthor = role(QtiMedia, "author", wholeEntriesOf(QtiMedia), {
  write: authorWrites,
});

/**
 * The author application's login over {@link QtiMedia}, over {@link MediaAuthor}, with the
 * workloads `AuthorApp` of `#pantry/qti/logins.ts` holds, `authorReads`, then the import's writes,
 * `insertWrite` and `removeWrite`: every program is over `Qti`, so its served file holds the same
 * members. It bears `AuthorApp`'s name, so grizzle writes it as
 * `migrations/<root>/served/author_app.json`. An application's grizzle config lists this or
 * `AuthorApp`, never both, since their names convert alike. An application that writes rows of its
 * own beside a package's in one transaction declares its own role over its own level instead,
 * writing `authorWrites` beside its relations, and composes `insertWrite` with its own writes
 * (`ChangeSet.union`, `ChangeSet.sequence`) into its one ChangeSet.
 */
export const MediaAuthorApp = login(QtiMedia, "author_app", [MediaAuthor], {
  workload: [
    workload(MediaAuthor, authorReads),
    workload(MediaAuthor, { insertWrite, removeWrite }),
  ],
});

/**
 * The author application's login over the media level, the type of {@link MediaAuthorApp}: the type
 * an application serves its committed workload as, read by `import type` alone.
 */
export type MediaAuthorAppLogin = typeof MediaAuthorApp;
