/**
 * The package-media level, `QtiMedia`: what an application stacks over `Qti` with grizzle's
 * `schema.extend` to serve a package's files, and the one authority on which files it serves. The
 * policy is the player's, one closed relation, {@link MediaType}, each extension a player is served
 * files of with the media type it is served them as, which the schema states and no program
 * writes. The level states no law: it refuses no package `Qti` admits, and only says which of a
 * document's files a player is given.
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
  closed,
  closedId,
  derived,
  Logic,
  login,
  query,
  role,
  schema,
  str,
  Text,
  Type,
  v,
  wholeEntriesOf,
  workload,
} from "@bjornpagen/grizzle";
import { Array as Arr, Record as Rec } from "effect";
import { authorReads, authorWrites, insertWrite } from "#pantry/qti/logins.ts";
import { CandidatePath, Media, ReferencePath, TextReferencePath } from "#pantry/qti/package.ts";
import { Qti } from "#pantry/qti/schema.ts";

/**
 * A file extension's text as the policy writes it: lowercase ASCII letters and digits, without its
 * dot, as an entry's path writes it after its last `.` (`photo.jpg` is `jpg`). An entry's extension
 * is matched against it in ASCII lower case, so one row serves `photo.jpg` and `photo.JPG`.
 */
const MediaExtensionText = str.regex("^[a-z0-9]{1,127}$");

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
 * The player's media policy, each extension whose files a player is served with the media type it
 * is served them as, the one policy of every installation: the file types the QTI player renders
 * and a browser runs, which no package and no application chooses. A media type may stand under
 * several extensions (`jpg` and `jpeg`). `js` is a Portable Custom Interaction's module, which QTI
 * 3.0.1's loader finds at a `.js` path (information model §7.17.2) and a browser runs only when it
 * is served as JavaScript (RFC 9239). An application that serves a package's files reads it here,
 * the rows {@link MediaType} holds, as each upload's `Content-Type`, and keeps no copy of its own.
 */
export const mediaPolicy = {
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  ogg: "audio/ogg",
  pdf: "application/pdf",
  png: "image/png",
  svg: "image/svg+xml",
  vtt: "text/vtt",
  wav: "audio/wav",
  webm: "video/webm",
  webp: "image/webp",
} as const;

/**
 * The `MediaExtension` roster, whose order means nothing: the extensions of {@link mediaPolicy}, the
 * key of {@link MediaType}.
 */
const MediaExtension = closed.unordered(
  "MediaExtension",
  Arr.map(Rec.keys(mediaPolicy), (extension) => extension),
);

/**
 * {@link mediaPolicy} as a closed relation, one row per extension: the extension, its text as a
 * path writes it, `name`, and the media type it is served as. The schema states it, a migration
 * alone changes it, and no program writes it, so a change of policy is a migration that derives
 * every package's served files again, and what a player is served is a function of its package's
 * own rows and the policy alone.
 */
export const MediaType = closed.relation(
  "MediaType",
  { extension: closedId(MediaExtension), name: MediaExtensionText, type: MediaTypeName },
  ["extension"],
  Arr.map(Rec.toEntries(mediaPolicy), ([extension, type]) => ({
    extension,
    name: extension,
    type,
  })),
);

/**
 * The policy's level over `Qti`: {@link MediaExtension} and {@link MediaType}, the closed relations
 * the level's derived relations read, a level of its own since a derived relation reads only the
 * levels below its own. It states no law.
 */
export const QtiMediaPolicy = schema.extend(
  [Qti],
  "QtiMediaPolicy",
  [MediaExtension, MediaType],
  [],
);

/**
 * Each extension of the policy with the media type it is served as, `suffix`, the extension with
 * its dot, as a path ends with it, and `segmentSuffix`, the suffix after a `/`, as a path ends with
 * it whose last segment is the suffix alone: a name that begins with its only `.`, which has no
 * extension.
 */
const policySuffixes = query(QtiMediaPolicy).rule((r) => {
  const { name, type } = v(MediaType, "policy");

  return r.match(MediaType, { name, type }).find({
    segmentSuffix: Text.concat(Type.literal(str.regex("^/[.]$"), "/."), name),
    suffix: Text.concat(Type.literal(str.regex("^[.]$"), "."), name),
    type,
  });
});

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
  const { segmentSuffix, suffix, type } = v(policySuffixes, "policy");

  return (
    r
      .match(Media, { package: pkg, path })
      .match(policySuffixes, { segmentSuffix, suffix, type })
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
 * grizzle config's `schemas`, so the installation holds `Qti`, the policy and these relations.
 */
export const QtiMedia = schema.extend([QtiMediaPolicy], "QtiMedia", [ServedFile, WithheldFile], []);

/**
 * The author role over {@link QtiMedia}, for an application whose author login is over the media
 * level: it holds every stored relation and roster of the installation whole, the policy's and the
 * level's derived relations among them (grizzle's `wholeEntriesOf`), and writes `Qti`'s stored
 * relations by their modes (`authorWrites` of `#pantry/qti/logins.ts`), as `Author` of
 * `#pantry/qti/roles.ts` does; the policy, {@link MediaType}, is a closed relation no role writes.
 * Every relation of `Qti` is closed, so each is under `insert`, which grants SELECT and INSERT and
 * no UPDATE or DELETE: a package is published whole (`insertWrite`) and never changed or removed.
 */
export const MediaAuthor = role(QtiMedia, "author", wholeEntriesOf(QtiMedia), authorWrites);

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
