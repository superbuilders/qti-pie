/**
 * The package-media level, `QtiMedia`: what an application stacks over `Qti` with grizzle's
 * `schema.extend` to serve a package's files, and the one authority on which files it serves. The
 * policy is data, the rows of {@link MediaType}, each extension the application serves files of
 * with the media type it serves them with, which the application writes as its own rows. The
 * level states no law: it refuses no package `Qti` admits, and only says which of a document's
 * files a player is given.
 *
 * - **{@link ServedFile}**: each media file a document names, a reference, an image candidate of a
 *   `srcset` or a text reference resolved to a `Media` entry of the package, whose extension a
 *   {@link MediaType} row lists, with its digest, which the application serves it under, and its
 *   media type. A player is given exactly these files' addresses.
 * - **{@link WithheldFile}**: each media file a document names whose extension no {@link MediaType}
 *   row lists. The application stores it, as a `Media` row, and serves it to no player: the player
 *   renders the document without it.
 *
 * **Why the level refuses nothing.** The QTI database imports packages, and the QTI 3.0 Conformance
 * and Certification document asks an importer to tell valid content from invalid (§2.2, "Importing
 * systems must be able to differentiate between valid and invalid instances of QTI content") and to
 * meet a feature it does not support without failing (§3, "All QTI 3.0 certified applications must
 * be able to operate without failure when features beyond the minimum required features are
 * included in the content ... the applications must be able to ignore or remove the unsupported
 * data"; §4.4, "Applications that do not support specific features can leave the exchangeable
 * materials unaltered, but not implement the unsupported features"). Nothing there lets a system
 * refuse a valid package, and the information model types every address it holds as an
 * `xs:anyURI` or a `URLDType` with no restriction to the package's files (`FileHrefDType`,
 * `<xs:restriction base="xs:anyURI" />`, xsd:24100-24102), so the level's former laws refused valid
 * QTI and are gone, each replaced by what a player is given:
 *
 * - An address outside the package (a URL with a scheme, `data:` among them, an absolute or a network
 *   path), and a calculator's or a digital material's file there (information model §5.80.3, "This
 *   is the URI for the associated content file"): stored unresolved (`HrefScope` `external`), named
 *   by no {@link ServedFile}; the player fetches no address it is not given (plate drops a remote
 *   URL in every context it would fetch, `#plate/model/url.ts`);
 * - A file of an extension the policy does not list, a stylesheet, a lexicon or a spelling of a type
 *   the policy does not write: stored and withheld ({@link WithheldFile});
 * - A file no document names: stored, never served, since no document names it;
 * - A `style` that would fetch, foreign markup the XSD's `##other` wildcards admit, an extension of
 *   the loose LOM binding (QTI 3.0 Metadata §3.6: "it permits extensions"), a kept entity reference
 *   and a document type declaration's external identifier: stored as written, and rendered by no
 *   player, which writes no author style and no element or attribute its tables do not declare, and
 *   reads the document's rows, never its document type declaration's subsets.
 *
 * Invalid QTI is still refused, by `Qti`'s own laws: a path that resolves in the package and names
 * no file of it breaks File exists (IMS Content Packaging 1.2, InterchangePackage (d)), whatever
 * field names it.
 *
 * An extension is the text after the last `.` of the target's last segment, where that `.` is not
 * the segment's first character, as Node's `path.posix.extname` reads that segment
 * ({@link listedMedia}), so a path that ends with `/` has none; matched without regard to
 * ASCII case, since no specification gives an extension's case a meaning, so `photo.JPG` is served
 * under a policy that lists `jpg`. A media type may be listed under several extensions, `jpg` and
 * `jpeg` both `image/jpeg`.
 *
 * A level reaches the relations below it through a query (README, "Levels"): both relations are
 * derived, over `Qti`'s tables and the policy's, and the importer writes no row of them.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/conf | QTI 3.0 Conformance and Certification, §2.2, §3, §4.4}
 * @see {@link https://nodejs.org/api/path.html#pathextnamepath | Node.js, path.extname}
 */
import {
  derived,
  generated,
  Logic,
  login,
  query,
  relation,
  role,
  schema,
  str,
  Text,
  Type,
  v,
  wholeEntriesOf,
  workload,
} from "@bjornpagen/grizzle";
import { authorReads, authorWrites, insertWrite } from "#pantry/qti/logins.ts";
import { CandidatePath, Media, ReferencePath, TextReferencePath } from "#pantry/qti/package.ts";
import { Qti } from "#pantry/qti/schema.ts";

/**
 * A file extension a policy lists: lowercase ASCII letters and digits, without its dot, as an
 * entry's path writes it after its last `.` (`photo.jpg` is `jpg`). An entry's extension is matched
 * against it in ASCII lower case, so one row serves `photo.jpg` and `photo.JPG`.
 */
const MediaExtension = str.regex("^[a-z0-9]{1,127}$");

/**
 * The most bytes a media type holds, a type and a subtype a `/` apart, each a restricted name of at
 * most 127 characters, every one ASCII: what {@link MediaTypeName}'s pattern admits, and the bound
 * a text that names a media type is held to where it holds none of the pattern.
 *
 * @limitKind published
 * @owner RFC 6838 (IETF, Media Type Specifications and Registration Procedures)
 * @unit UTF-8 bytes
 * @scope one media type, a type and a subtype with no parameter
 * @constraint compile-time constant
 * @source https://www.rfc-editor.org/rfc/rfc6838#section-4.2
 * @quote restricted-name = restricted-name-first *126restricted-name-chars
 * @verified 2026-11-21
 */
export const mediaTypeBytes = 127 + 1 + 127;

/**
 * The media type a policy serves an extension's files with, as an HTTP `Content-Type` names it: a
 * type and a subtype, each a restricted name (RFC 6838, §4.2), in lower case, the form the registry
 * writes, with no parameter, of at most {@link mediaTypeBytes}.
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
 * An extension with its dot and a `/` before it, as a path ends with it whose last segment is the
 * suffix alone: a name that begins with its only `.`, which has no extension.
 */
const SegmentSuffix = str.regex("^/[.][a-z0-9]{1,127}$");

/**
 * The application's media policy, one row per extension it serves files of: the extension, the
 * media type it serves them with, `suffix`, the extension with its dot, as a path ends with it, and
 * `segmentSuffix`, the suffix after a `/`, as a path ends with it whose last segment is the suffix
 * alone, each of which PostgreSQL generates. A media type may stand under several extensions. A
 * policy of no row serves no file: every file a document names is then withheld.
 */
export const MediaType = relation.generated(
  "MediaType",
  { extension: MediaExtension, type: MediaTypeName },
  ["extension"],
  (m) => ({
    segmentSuffix: generated(
      SegmentSuffix,
      Text.concat(Type.literal(str.regex("^/[.]$"), "/."), m.extension),
    ),
    suffix: generated(Suffix, Text.concat(Type.literal(str.regex("^[.]$"), "."), m.extension)),
  }),
);

/**
 * The policy's level over `Qti`: {@link MediaType}, the rows the level's derived relations read, a
 * level of its own since a derived relation reads only the levels below its own. It states no law.
 *
 * An application writes these rows through a role of their own, one that writes nothing its READ
 * COMMITTED readers read: a reader of {@link ServedFile} reads `MediaType`, so a role writing it
 * beside relations that reader reads gives grizzle's certifier another writer of that reader's
 * reads, and it lifts the reader to SERIALIZABLE (found by edullm: a publisher that also wrote the
 * policy moved its learner).
 */
export const QtiMediaPolicy = schema.extend([Qti], "QtiMediaPolicy", [MediaType], []);

/**
 * The relations a role that writes the media policy inserts, by name: {@link QtiMediaPolicy}'s one
 * stored relation, {@link MediaType}, which `authorWrites` of `#pantry/qti/logins.ts` leaves out,
 * since the author role writes `Qti` alone. An application's role that writes the policy lists
 * these in its insert list.
 */
export const mediaPolicyWrites = [MediaType.name] as const;

/**
 * Every media file each document names, by the document's place and the file's path, with the
 * digest the application serves it under: the target of each reference, image candidate and text
 * reference resolved in the package (`ReferencePath`, `CandidatePath`, `TextReferencePath`) that
 * is a `Media` entry. A target that is a document (an item ref's item, an include's target) is no
 * media file and names none here.
 */
const namedMedia = query(QtiMediaPolicy)
  .rule((r) => {
    const { package: pkg, path, target } = v(ReferencePath, "reference");
    const { digest } = v(Media, "media");

    return r
      .match(ReferencePath, { package: pkg, path, target })
      .match(Media, { digest, package: pkg, path: target })
      .find({ digest, package: pkg, path, target });
  })
  .rule((r) => {
    const { package: pkg, path, target } = v(CandidatePath, "candidate");
    const { digest } = v(Media, "media");

    return r
      .match(CandidatePath, { package: pkg, path, target })
      .match(Media, { digest, package: pkg, path: target })
      .find({ digest, package: pkg, path, target });
  })
  .rule((r) => {
    const { package: pkg, path, target } = v(TextReferencePath, "text");
    const { digest } = v(Media, "media");

    return r
      .match(TextReferencePath, { package: pkg, path, target })
      .match(Media, { digest, package: pkg, path: target })
      .find({ digest, package: pkg, path, target });
  });

/**
 * Every media entry of a package whose extension a {@link MediaType} row lists, with the media
 * type the row serves it as: its path, in ASCII lower case, ends with the row's suffix, and neither
 * ends with its segment suffix nor is the suffix alone, so a character that is no `/` stands before
 * the `.`, which is then not its last segment's first character, as Node's `path.posix.extname`
 * reads an extension. A path of any length is read so, by text comparisons alone, with no pattern
 * or length its size could outgrow.
 *
 * @see {@link https://nodejs.org/api/path.html#pathextnamepath | Node.js, path.extname}
 */
const listedMedia = query(QtiMediaPolicy).rule((r) => {
  const { package: pkg, path } = v(Media, "media");
  const { segmentSuffix, suffix, type } = v(MediaType, "policy");

  return (
    r
      .match(Media, { package: pkg, path })
      .match(MediaType, { segmentSuffix, suffix, type })
      // GRIZZLE-PENDING: a boolean term as a predicate
      .where(Logic.eq(Text.endsWith(Text.lowerAscii(path), suffix), true))
      .where(Logic.eq(Text.endsWith(Text.lowerAscii(path), segmentSuffix), false))
      .where(r.ne(Text.lowerAscii(path), suffix))
      .find({ package: pkg, path, type })
  );
});

/**
 * Each media file a document names that the application serves, by the document's place and the
 * file's path, with the digest it serves it under and its media type: every named media file
 * ({@link namedMedia}) of an extension the policy lists ({@link listedMedia}). A player is given
 * these files' addresses and no other.
 */
export const ServedFile = derived(
  "ServedFile",
  query(QtiMediaPolicy).rule((r) => {
    const { digest, package: pkg, path, target } = v(namedMedia, "named");
    const { type } = v(listedMedia, "listed");

    return r
      .match(namedMedia, { digest, package: pkg, path, target })
      .match(listedMedia, { package: pkg, path: target, type })
      .find({ digest, package: pkg, path, target, type });
  }),
);

/**
 * Each media file a document names that the application withholds, by the document's place and the
 * file's path: every named media file ({@link namedMedia}) of an extension no {@link MediaType} row
 * lists. It is stored and never served, and a player renders the document without it, as QTI 3.0
 * Conformance §3 asks of a feature an application does not support ("ignore or remove the
 * unsupported data").
 */
export const WithheldFile = derived(
  "WithheldFile",
  query(QtiMediaPolicy).rule((r) => {
    const { package: pkg, path, target } = v(namedMedia, "named");

    return r
      .match(namedMedia, { package: pkg, path, target })
      .where(r.not(listedMedia, { package: pkg, path: target }))
      .find({ package: pkg, path, target });
  }),
);

/**
 * The package-media level over {@link QtiMediaPolicy}: {@link ServedFile} and
 * {@link WithheldFile}, and no law. An application lists it, or a level of its own over it, in its
 * grizzle config's `schemas`, so the installation holds `Qti`, the policy and these relations, and
 * writes its policy as {@link MediaType} rows.
 */
export const QtiMedia = schema.extend([QtiMediaPolicy], "QtiMedia", [ServedFile, WithheldFile], []);

/**
 * The author role over {@link QtiMedia}, for an application whose author login is over the media
 * level: it holds every stored relation and roster of the installation whole, the policy's and the
 * level's derived relations among them (grizzle's `wholeEntriesOf`), and writes `Qti`'s stored
 * relations (`authorWrites` of `#pantry/qti/logins.ts`), as `Author` of `#pantry/qti/roles.ts`
 * does, and no relation of the policy: {@link MediaType} is written through a role of its own, one
 * that writes nothing a READ COMMITTED reader reads ({@link QtiMediaPolicy}). grizzle's `insert`
 * grants SELECT and INSERT on each table it names, and no UPDATE or DELETE, since every relation
 * of `Qti` is closed: a package is published whole (`insertWrite`) and never changed or removed.
 */
export const MediaAuthor = role(QtiMedia, "author", wholeEntriesOf(QtiMedia), {
  insert: authorWrites,
});

/**
 * The author application's login over {@link QtiMedia}, over {@link MediaAuthor}, with the
 * workloads `AuthorApp` of `#pantry/qti/logins.ts` holds, `authorReads`, then the import's write,
 * `insertWrite`: every program is over `Qti`, so its served file holds the same
 * members. It bears `AuthorApp`'s name, so grizzle writes it as
 * `migrations/<root>/served/author_app.json`. An application's grizzle config lists this or
 * `AuthorApp`, never both, since their names convert alike. An application that writes rows of its
 * own beside a package's in one transaction declares its own role over its own level instead,
 * inserting `authorWrites` beside its relations, and composes `insertWrite` with its own writes
 * (`ChangeSet.union`, `ChangeSet.sequence`) into its one ChangeSet.
 */
export const MediaAuthorApp = login(QtiMedia, "author_app", [MediaAuthor], {
  workload: [workload(MediaAuthor, authorReads), workload(MediaAuthor, { insertWrite })],
});

/**
 * The author application's login over the media level, the type of {@link MediaAuthorApp}: the type
 * an application serves its committed workload as, read by `import type` alone.
 */
export type MediaAuthorAppLogin = typeof MediaAuthorApp;
