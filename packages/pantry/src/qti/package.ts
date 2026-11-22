/**
 * The package and its entries, and the manifest's overlays (plan §1.6; the W5 amendment's C17 and
 * C18; the orchestrator's rulings of 2026-11-06 and spec reading 93).
 *
 * {@link Package} is keyed by its name, and holds its {@link Entry} rows, a set keyed by path: the
 * package's files (IMS Content Packaging 1.2: every file is an entry of its package), none holding
 * bytes. An entry is a document, whose one representation is its tree, or media, whose bytes a
 * content-addressed store holds under the SHA-256 its {@link Media} row states: the database is no
 * document store, so each fact has one representation. The manifest's elements that a law reads
 * across rows are read where their attributes stand: the manifest's and each resource's
 * `identifier` (`manifestIdentifiers`, `resourceIdentifiers`), a resource's type code
 * (`resourceTypes`) and a dependency's resource (`Dependency`) are queries over `Attribute`
 * (`#pantry/qti/overlay-queries/package.ts`, `#pantry/qti/queries.ts`), each reading its
 * attribute's `value`, which no row copies (C18). What the database cannot derive is stored, keyed
 * by its element's node, `(package, path, start)`: a resource's optional {@link ResourceHref}
 * (`cp:resource`) and a {@link File} (`cp:file`), each holding the importer's resolution of its href
 * and no copy of its form. An identifier that may be unwritten is a row of its own, or none
 * (AGENTS.md, Schema intent): a `cp:manifest` that writes no `identifier` has no identifier, and a
 * `cp:resource` none none, so AL3 refuses the element alone and no law compares an identifier it
 * does not have.
 *
 * A resource's `type` that is written but spells no `ResourceType` handle is unread: the resource
 * has no type code and its href no typed href, and its href is one of the query `UnreadTypeHref`'s
 * rows instead (`#pantry/qti/queries.ts`), a join no table stores rather than a sentinel code, so a
 * law can read that a resource names the path with a type the importer could not read (the
 * oracle's `itemRefTargetOf` names no target there).
 *
 * No relation stores a projection or a resolution the files and dependencies already give: the
 * hrefs a package's files name, the hrefs each resource's files name (a file's resource is its
 * node's parent), and the resource a dependency names are queries (`#pantry/qti/overlay-queries/
 * package.ts`), and "File listed", "Href listed", "Dependency target" and "Self dependency" are
 * rules over them, since a file may be listed by several resources and twice by one (spec reading
 * 36), so no file href is a key. The hrefs of the typed resources are a query too, `TypedHref`
 * (`#pantry/qti/queries.ts`): the laws over a typed href, and over the (path, type) pairs the
 * package's resources name, are rules over it.
 *
 * A resource names a document only through its `href` (reading 93): a resource of a type
 * `RootOfType` maps names the document at its `href`, and every other document is the manifest.
 *
 * An href is read in two written pieces, `path ‖ params` (reading 102): `params` is empty or starts
 * at the first `?` or `#`, a query or a fragment, and only `path` names a file. So a resource's
 * `href` may carry launch parameters its file's `href` does not (IMS Content Packaging 1.2,
 * §6.6.2), and a reference may carry a media fragment.
 *
 * The importer resolves every href before it writes a row (readings 102 and 103,
 * `#pantry/import/overlays/package.ts` `resolveIn`): it reads the value by its attribute's
 * whitespace class, merges the path with its base, the document's own path or the `xml:base` in
 * scope, removes its dot segments and percent-decodes it (RFC 3986, §2.1 and §5.2). Each row holds
 * the outcome as its {@link HrefScope} and, in the package, the entry path it names, which the laws
 * compare with `Entry`. No relation can percent-decode a name, so the resolution is the importer's,
 * and the law oracle's own resolver (`#pantry/test/resolution.ts`) is its differential; the
 * database proves what a row can: a resolved path holds no dot segment
 * ({@link resolvedPathPattern}), and a reference with a scheme or a leading `/` is external.
 *
 * Every in-package file a manifest or a document names is an entry (IMS Content Packaging 1.2,
 * InterchangePackage (b) and (d)): a `cp:file`'s resolved path (`file-exists`), and each
 * {@link ReferencePath}, a reference of a document resolved in the package. A dependency never
 * names its own resource (IMS Content Packaging 1.2, §6.11.5 B ii).
 *
 * @see {@link https://www.imsglobal.org/content/packaging/ | IMS Content Packaging 1.2}
 */
import {
  alternatives,
  check,
  closed,
  closedId,
  contained,
  drawn,
  generated,
  mirrors,
  natural,
  on,
  relation,
  select,
  str,
  Text,
} from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import {
  anyText,
  AttributeName,
  DocumentType,
  NodeKind,
  ReferenceAttribute,
  ResourceDocumentType,
  ResourceType,
  RootOfType,
} from "#pantry/grammar/install.ts";
import { textReferenceKinds } from "#pantry/grammar/references.ts";
import { Attribute, attributesOf, namedOn } from "#pantry/qti/attributes.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { EntryPath, matchedTextBytes, PackageName } from "#pantry/qti/limits.ts";
import { Node } from "#pantry/qti/node.ts";
import { Space, tokenFields, tokenList } from "#pantry/qti/token-list.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";
import { includeKind } from "#pantry/vocab/terms/tests.ts";

/**
 * A `#` anywhere in a text: an `xi:include`'s parameters that hold a fragment identifier.
 */
const fragmentMark = Text.pattern("#");

/**
 * A package, keyed by its name (`PackageName`, `#pantry/qti/limits.ts`), the name its importer's
 * caller gives it, which every row of the package holds as its `package`: the same package
 * imported again under its name is the same rows, and another package under a stored name is
 * refused on the keys the two share, so a name is one revision for as long as it stands. IMS
 * Content Packaging makes a manifest's `identifier` unique within its manifest alone (1.2,
 * §6.11.4), so it is the package's data, its `manifestIdentifiers`
 * (`#pantry/qti/overlay-queries/package.ts`), and no key: two packages that share one are two
 * names.
 */
export const Package = relation("Package", { name: PackageName }, ["name"]);

/**
 * A SHA-256 digest as text: 64 lowercase hex digits, the form a content-addressed store names a
 * file's bytes by (the media CDN's `sha256/<digest>`).
 */
export const Sha256Hex = str.regex("^[0-9a-f]{64}$");

/**
 * What an entry is: a `document`, which the import shreds and the database holds as its tree alone
 * ({@link Document}), or `media`, every other file, whose bytes a content-addressed store holds
 * under the digest its {@link Media} row states.
 */
export const EntryKind = closed.ordered("EntryKind", ["document", "media"]);

/**
 * One file of a package, keyed by its package and its path: a set, since IMS Content Packaging
 * gives a package's listing order no meaning, and the header of its {@link EntryKind}'s arm, a
 * {@link Document} or a {@link Media} row ("Entry kind"). It holds no bytes: a document's one
 * representation is its tree, which the export writes back as canonical XML, and a media file's
 * bytes are the content-addressed store's, under its digest. Whether the entry is the manifest is a
 * function of `path`, so it is not stored (review R19).
 */
export const Entry = relation(
  "Entry",
  { kind: closedId(EntryKind), package: PackageName, path: EntryPath },
  ["package", "path"],
);

/**
 * A media entry, keyed by its entry: `digest`, the SHA-256 of its bytes ({@link Sha256Hex}), which
 * the host that read the bytes states, and under which it put them in the content-addressed store
 * before it wrote the row (`#pantry/package/media.ts` `MediaStore`; the media CDN on the QTI
 * install). PostgreSQL holds no bytes to compute it from, and the store is content-addressed, so
 * the digest names exactly the bytes a player is served. A player fetches the file by it.
 */
export const Media = relation(
  "Media",
  { digest: Sha256Hex, package: PackageName, path: EntryPath },
  ["package", "path"],
);

/**
 * The pattern of an href's `params` piece (reading 102): empty, or a query or a fragment, from the
 * first `?` or `#` to the end (RFC 3986, §3.4 and §3.5, which end a path at either). The `path`
 * before it holds neither ({@link hrefPathPattern}), so the split of an href is one.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc3986#section-3.4 | RFC 3986, §3.4}
 */
export const hrefParamsPattern = "^(?:[?#].*)?$";

/**
 * The pattern of an href's `path` piece: no `?` and no `#`, the characters that start `params`.
 */
export const hrefPathPattern = Text.pattern("^[^?#]*$");

/**
 * An href's `params` piece, its query or fragment (reading 102): text no key holds and no law
 * compares but "Include fragment identifier", written beside the reference's target it follows so
 * the pieces concatenate to the lexical form.
 */
export const HrefParams = str.regex(hrefParamsPattern, "su");

/**
 * An external href, which names no package entry and is never resolved: a URI with a scheme
 * (reading 35's absolute href), or a reference that starts with `/`, a network path or an absolute
 * path, which resolves against the location a package is read from rather than within it (reading
 * 102). The pattern reads the start of the href alone.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc3986#section-4.2 | RFC 3986, §4.2}
 */
export const externalHrefPattern = Text.pattern("^(?:[A-Za-z][A-Za-z0-9+.\\-]*:|/)");

/**
 * What a `srcset` holds before an image candidate's URL and after its last one: whitespace and
 * commas (HTML, "parse a srcset attribute", which skips both).
 */
export const SrcsetGap = str.regex("^[\\t\\n\\r ,]*$");

/**
 * The pattern of an image candidate's URL as a `srcset` writes it: a run of non-whitespace
 * characters that starts and ends with no comma (HTML, "parse a srcset attribute": the URL is
 * collected up to whitespace, its trailing commas given back), of any length, since QTI bounds no
 * URL and a key holds only a resolved path.
 */
export const srcsetUrlPattern = "^[^\\t\\n\\r ,](?:[^\\t\\n\\r ]*[^\\t\\n\\r ,])?$";

/**
 * An image candidate's URL, {@link srcsetUrlPattern}'s text.
 */
export const SrcsetUrl = str.regex(srcsetUrlPattern);

/**
 * An image candidate's URL as `SrcsetCandidate.url` holds it: {@link SrcsetUrl}'s text, at most
 * `matchedTextBytes` UTF-8 bytes, since a law matches it (`SrcsetCandidate`'s `E1_derived` check
 * reads it by `Text.matches`), the bound of `#pantry/qti/limits.ts` (the `srcset`'s stated
 * limit).
 */
export const SrcsetCandidateUrl = str.bytes(matchedTextBytes, SrcsetUrl);

/**
 * What leads every image candidate after the first: whitespace and commas holding at least one
 * comma, the one that ended the candidate before it (HTML, "parse a srcset attribute": a
 * candidate's descriptors end at a comma, and a URL's trailing commas end it).
 */
const srcsetSeparator = Text.pattern("^[\\t\\n\\r ]*,[\\t\\n\\r ,]*$");

/**
 * An image candidate's descriptors as written: empty, or whitespace and the rest of the candidate
 * up to the comma that ends it, which no law reads (spec reading 124).
 */
export const SrcsetDescriptor = str.regex("^(?:[\\t\\n\\r ].*)?$", "su");

/**
 * How an href resolves (readings 102 and 103), the outcome the importer writes on every href's row:
 *
 * - `entry`: a path in the package, which names the entry the row holds as its `path`;
 * - `external`: a location outside the package, admitted and never resolved: a URI with a scheme
 *   (reading 35), a network or absolute path (a leading `/`, reading 102), a path whose `..`
 *   segments climb above the package root, and any relative href in the scope of an `xml:base` that
 *   is one of those;
 * - `document`: its own document, admitted and never resolved: a path that is empty, as the empty
 *   reference, a query alone and a fragment alone have (RFC 3986, §4.4, a same-document reference,
 *   whose dereference "should not result in a new retrieval action");
 * - `unresolved`: a path this representation reads no name from, refused under the stated limit "Href
 *   form" (`#pantry/import/overlays/package.ts` `Limit`).
 */
export const HrefScope = closed.ordered("HrefScope", [
  "entry",
  "external",
  "document",
  "unresolved",
]);

/**
 * The form of a path the importer resolved in the package (RFC 3986, §5.2.4, after which no dot
 * segment remains): `/`-separated segments, the first nonempty, none `.` or `..`, any other
 * character allowed, since a decoded name may hold `?`, `#`, `%`, `:` or a space. A path that ends
 * with `/` names a directory, and the empty path the package root, which no entry is.
 */
export const resolvedPathPattern = Text.pattern(
  "^(?:(?:[^/.][^/]*|\\.[^./][^/]*|\\.\\.[^/]+)(?:/(?:[^/.][^/]*|\\.[^./][^/]*|\\.\\.[^/]+)?)*)?$",
);

/**
 * A resource's `href`'s resolution, keyed by the resource's node, a row exactly where the resource
 * writes an `href` (an optional attribute is a row of its own): its {@link HrefScope}; and
 * `target`, what it is compared by: the entry path it resolves to in the package, and otherwise
 * its path as written, its launch parameters aside (CP 1.2 §6.6.2, reading 102), which is how an
 * external href is compared with its resource's files. The `href` as written is its `Attribute`
 * row's alone, which no row copies (C18). Beside its resource's type code (`resourceTypes` of
 * `#pantry/qti/queries.ts`) it is a typed href, the query `TypedHref`.
 */
export const ResourceHref = relation(
  "ResourceHref",
  {
    package: PackageName,
    path: EntryPath,
    scope: closedId(HrefScope),
    start: natural,
    target: anyText,
  },
  ["package", "path", "start"],
);

/**
 * A document a resource of its package lists, keyed by its document, `(package, path)`: the type of
 * that resource
 * (IMS Content Packaging 1.2: a resource's file; spec reading 176). The package's manifest is no
 * resource's document (spec reading 146) and has no row: its type is `manifest`, its `Document`'s
 * `documentType`, and every other document's is the type here, by `ResourceDocumentType`.
 *
 * - **the host's:** `type`, the type its listing names it under (`#pantry/import/program.ts`); and
 *   its `Document`'s key and `rootKind`, which "E1 derived" proves;
 * - **the database's:** `documentType`, its type's (`ResourceDocumentType`), which its `Document`
 *   holds.
 */
export const ResourceDocument = relation.generated(
  "ResourceDocument",
  {
    package: PackageName,
    path: EntryPath,
    rootKind: closedId(NodeKind),
    type: closedId(ResourceType),
  },
  ["package", "path"],
  (r) => ({
    documentType: generated(
      closedId(DocumentType),
      ResourceDocumentType.at("documentType", r.type),
    ),
  }),
);

/**
 * A file's `href`'s resolution, keyed by the `cp:file` node, a row for each `cp:file` that writes
 * an `href`: its {@link HrefScope}, and `target`, what it is compared by as {@link ResourceHref}'s
 * is: the entry path it resolves to in the package, and otherwise its path as written. The `href`
 * as written is its `Attribute` row's alone, which no row copies (C18). Its resource is its node's
 * parent, which "Href listed" reads through `Node`.
 */
export const File = relation(
  "File",
  {
    package: PackageName,
    path: EntryPath,
    scope: closedId(HrefScope),
    start: natural,
    target: anyText,
  },
  ["package", "path", "start"],
);

/**
 * A reference attribute's value, keyed by its element and its attribute's name: every attribute of
 * the reference census (`ReferenceAttribute`, the grammar's, spec reading 103), its element's kind
 * copied from `Attribute`, and the split of the attribute's lexical form, which no row copies
 * (C18): its outer whitespace, which a URL "potentially surrounded by spaces" and an `xs:anyURI`
 * both set aside, then its path and its query or fragment (reading 102). `params` is what "Include
 * fragment identifier" reads. `E1_derived` holds the attribute's `lexical` to
 * `lead ‖ target ‖ params ‖ trail` by a rule over the join of the two (`ReferenceLexical`,
 * `#pantry/qti/queries.ts`), which builds no text.
 *
 * `target` has no byte bound: QTI bounds no URL (a `data:` URI, a signed address), and no key holds
 * it; only a target resolved in the package, its {@link ReferencePath}'s `EntryPath`, is bounded.
 *
 * Its {@link HrefScope} is the importer's resolution of its value (readings 102 and 103): a
 * reference in the package has its {@link ReferencePath}, and no other reference has one.
 * `E1_derived` holds what the written form decides: a target with a scheme or a leading `/` is
 * external, and only an empty target names its own document.
 */
export const Reference = relation(
  "Reference",
  {
    kind: closedId(NodeKind),
    lead: Space,
    name: closedId(AttributeName),
    package: PackageName,
    params: HrefParams,
    path: EntryPath,
    scope: closedId(HrefScope),
    start: natural,
    target: anyText,
    trail: Space,
  },
  ["package", "path", "start", "name"],
);

/**
 * A reference resolved in the package, keyed by its element and its attribute's name: its
 * {@link Reference}'s element kind, and `target`, the entry path the importer resolved it to in the
 * row's own package (RFC 3986, §5.2 and §2.1; readings 102 and 103).
 *
 * Every in-package file a document references is an entry (`file-exists`, IMS Content Packaging
 * 1.2, InterchangePackage (d)), and a law that reads what a reference names (an item ref's item,
 * Q5.13's) reads it here. `target` is an `EntryPath`: it rides the containment into `Entry`.
 */
export const ReferencePath = relation(
  "ReferencePath",
  {
    kind: closedId(NodeKind),
    name: closedId(AttributeName),
    package: PackageName,
    path: EntryPath,
    start: natural,
    target: EntryPath,
  },
  ["package", "path", "start", "name"],
);

/**
 * An element's text as a reference to a file, keyed by its element: every element of a kind of
 * `textReferenceKinds` (spec reading R9-b), its kind copied from `Node`, and the split of its
 * string value, `Node.stringValue`, which no row copies (C18). `E1_derived` holds the string value
 * to `lead ‖ target ‖ params ‖ trail` as it holds a {@link Reference}'s attribute to its split, by
 * a rule over the join of the two (`TextReferenceStringValue`, `#pantry/qti/queries.ts`; reading
 * 102). The census names elements, not attributes, so no attribute name keys it, and no `srcset`
 * form applies.
 *
 * Its {@link HrefScope} is the importer's resolution of its text (readings 102 and 103): a text
 * reference in the package has its {@link TextReferencePath}, and no other has one.
 */
export const TextReference = relation(
  "TextReference",
  {
    kind: closedId(NodeKind),
    lead: Space,
    package: PackageName,
    params: HrefParams,
    path: EntryPath,
    scope: closedId(HrefScope),
    start: natural,
    target: anyText,
    trail: Space,
  },
  ["package", "path", "start"],
);

/**
 * A text reference resolved in the package, keyed by its element: its {@link TextReference}'s
 * element kind, and `target`, the entry path the importer resolved it to in the row's own package
 * (RFC 3986, §5.2 and §2.1; readings 102 and 103), which rides the containment into `Entry` as a
 * {@link ReferencePath}'s does.
 */
export const TextReferencePath = relation(
  "TextReferencePath",
  {
    kind: closedId(NodeKind),
    package: PackageName,
    path: EntryPath,
    start: natural,
    target: EntryPath,
  },
  ["package", "path", "start"],
);

/**
 * A `srcset`'s split, keyed by its element (spec reading 103's census, form `srcset`), a row
 * exactly where the element writes one ({@link srcsetAttributes}): its image candidates
 * ({@link SrcsetCandidate}, HTML's "image candidate strings"), counted by `tokens`, and `trail`,
 * the whitespace and commas after the last. The form as written is its `Attribute` row's alone,
 * which no row copies (C18): `E1_derived` over the query `SrcsetForm`
 * (`#pantry/qti/overlay-queries/package.ts`), which reads the attribute's `lexical` beside the
 * split, proves the candidates' pieces in order, `tokenText`, then `trail`, are the form. A
 * `srcset` names a file by each candidate's URL alone, so it has no {@link Reference}.
 *
 * - **the element's:** `package`, `path` and `start`;
 * - **the host's:** `trail`;
 * - **drawn:** `tokens`, its candidates;
 * - **accumulated:** `tokenText`, the end of its candidates' concatenation, any text, which the
 *   family's axes carry by its image (grizzle's README: a `Monoid.concat` fold's accumulators ride
 *   its axes by their images), so a `srcset` has no byte bound of its own, only each candidate's
 *   URL ({@link SrcsetCandidateUrl}).
 */
export const Srcset = relation(
  "Srcset",
  {
    package: PackageName,
    path: EntryPath,
    start: natural,
    tokenText: tokenFields.piecesWas,
    tokens: tokenFields.at,
    trail: SrcsetGap,
  },
  ["package", "path", "start"],
);

/**
 * One image candidate of a `srcset`, in order (HTML, "parse a srcset attribute"; the host's split,
 * `srcsetCandidatesOf` of `#pantry/import/pieces.ts`): `lead`, the whitespace and commas before its
 * URL; `url`, at most `matchedTextBytes` UTF-8 bytes ({@link SrcsetCandidateUrl}), since its check
 * reads it by `Text.matches` (the `srcset`'s stated limit); and `descriptor`, the rest of the
 * candidate. Its URL is resolved as an href is
 * (readings 102 and 103), its outcome its {@link HrefScope}, and one resolved in the package has
 * its {@link CandidatePath}.
 *
 * - **the host's:** `lead`, `url`, `descriptor` and `scope`;
 * - **generated:** `piece`, `lead ‖ url ‖ descriptor`, the concatenation's step;
 * - **the family's group:** `package`, `path` and `start`, its element's;
 * - **drawn:** `at`;
 * - **accumulated:** `piecesWas` and `piecesAfter`, the concatenation before and after it.
 */
export const SrcsetCandidate = relation.generated(
  "SrcsetCandidate",
  {
    at: drawn(natural),
    descriptor: SrcsetDescriptor,
    lead: SrcsetGap,
    package: PackageName,
    path: EntryPath,
    piecesAfter: tokenFields.piecesAfter,
    piecesWas: tokenFields.piecesWas,
    scope: closedId(HrefScope),
    start: natural,
    url: SrcsetCandidateUrl,
  },
  ["package", "path", "start", "at"],
  (c) => ({
    piece: generated(anyText, Text.concat(Text.concat(c.lead, c.url), c.descriptor)),
  }),
);

/**
 * An image candidate resolved in the package, keyed by its element and its place among the
 * candidates: `target`, the entry path the importer resolved its URL to in the row's own package,
 * which rides the containment into `Entry` as a {@link ReferencePath}'s does.
 */
export const CandidatePath = relation(
  "CandidatePath",
  {
    at: natural,
    package: PackageName,
    path: EntryPath,
    start: natural,
    target: EntryPath,
  },
  ["package", "path", "start", "at"],
);

/**
 * State that an attribute is the `href` of one manifest element kind ({@link namedOn}), in the
 * package's manifest: the document at {@link manifestPath}, which `RootOfType` holds to be the
 * manifest exactly there.
 *
 * @param a - The row.
 * @param kind - The element's kind.
 * @returns The predicate.
 */
const inManifest = (a: RowScalars<typeof Attribute>, kind: "cp:file" | "cp:resource") =>
  a.and(namedOn(a, "href", [kind]), a.eq(a.path, manifestPath));

/**
 * Select the `href`s of the elements of one kind in the package's manifest. The manifest
 * is the package's one `imsmanifest.xml` (IMS Content Packaging 1.2), the one document of type
 * `manifest`, at that path alone (`RootOfType`'s check), and a content packaging element of another
 * document describes no part of the package (170356bd's ruling), so its attributes are no row's.
 * Every selection here fixes `name`, so `Attribute`'s key keys it by its element's place, and a
 * containment into it there reads that key.
 *
 * An href's row stands exactly where the href is written, its existence held both ways at its
 * element's place, and holds no copy of its form: it holds the importer's resolution of it, which
 * no relation can compute. A `cp:file`'s `href` is required (AL3), so a {@link File} is held to it
 * one way alone; a resource's `href` is optional, so its {@link ResourceHref} is held to it both
 * ways.
 *
 * @param kind - The element's kind.
 * @returns The selection.
 */
const manifestHrefs = (kind: "cp:file" | "cp:resource") =>
  select(Attribute, (a) => inManifest(a, kind));

/**
 * The `href` of each `cp:resource` that has one.
 */
const resourceHrefs = manifestHrefs("cp:resource");

/**
 * The `href` of each `cp:file`.
 */
const fileHrefs = manifestHrefs("cp:file");

/**
 * Select the nodes of one kind: a containment into it on `(package, path, start)` is a fixed
 * target, its source meeting the kind by a constant column, so every such containment references
 * the one `UNIQUE (package, path, start, kind)` on `Node` that the document layer's arms share
 * (`laws/model/plan.ts` `#fixedTarget`).
 *
 * @param kind - The kind.
 * @returns The selection.
 */
const nodesOf = (kind: "cp:file" | "cp:resource") => select(Node, (n) => n.eq(n.kind, kind));

/**
 * The files the importer resolved in the package: each names an entry (`file-exists`). An external
 * href is left out (reading 35), and so is one that names its own document, the manifest.
 */
const entryFiles = select(File, (f) => f.eq(f.scope, "entry"));

/**
 * The entries a `cp:file` lists: every one but the manifest. Exported for "File listed"
 * (`#pantry/qti/overlay-queries/package.ts`).
 */
export const listedEntries = select(Entry, (e) => e.ne(e.path, manifestPath));

/**
 * The attributes of the reference census (`ReferenceAttribute`, spec reading 103) of the forms that
 * name one file, `uri`, `package` and `module`: each an attribute by which an element of its kind
 * names one file. Each is a {@link Reference}'s copy (C18), and every
 * {@link Reference} is one's, a containment into this selection at `(package, path, start, name)`,
 * `Attribute`'s key.
 */
const censusAttributes = select(Attribute, (a) =>
  a.in(ReferenceAttribute.at("form", a.kind, a.name), ["uri", "package", "module"]),
);

/**
 * The kinds whose `srcset` the reference census reads as a list of image candidates: its rows of
 * the form `srcset` (`ReferenceAttribute`, spec reading 103).
 */
const srcsetKinds = ReferenceAttribute.rows.flatMap(({ form, kind, name }) =>
  form === "srcset" && name === "srcset" ? [kind] : [],
);

/**
 * The attributes of the reference census of the form `srcset`: each a list of image candidates
 * (HTML, "srcset attributes"), which has its {@link Srcset}, and every {@link Srcset} is one's,
 * the two mirrored at the element's place, which `Attribute`'s key keys since the selection fixes
 * the name.
 */
const srcsetAttributes = attributesOf("srcset", srcsetKinds);

/**
 * The image candidates the importer resolved in the package: each has its {@link CandidatePath},
 * and every {@link CandidatePath} is one's.
 */
const entryCandidates = select(SrcsetCandidate, (c) => c.eq(c.scope, "entry"));

/**
 * The references the importer resolved in the package, one per element and name by `Reference`'s
 * primary key: each has its {@link ReferencePath}, and every {@link ReferencePath} is one's.
 */
const entryReferences = select(Reference, (r) => r.eq(r.scope, "entry"));

/**
 * The elements of the text census (`textReferenceKinds`, spec reading R9-b): each a
 * {@link TextReference}'s copy (C18). `Node`'s own key keys it, so the copy's reverse probe reads
 * that key, and no index holds the string value.
 */
const textReferenceNodes = select(Node, (n) =>
  n.in(
    n.kind,
    NodeKind.handles.filter((handle) => textReferenceKinds.some(({ kind }) => kind === handle)),
  ),
);

/**
 * The text references the importer resolved in the package, a constant selection keyed by its
 * element: each has its {@link TextReferencePath}, and every {@link TextReferencePath} is one's.
 */
const entryTextReferences = select(TextReference, (r) => r.eq(r.scope, "entry"));

/**
 * The resolved hrefs of stimulus refs: each names a stimulus document (the UP audit's B5).
 */
const stimulusPaths = select(ReferencePath, (p) => p.eq(p.kind, "qti-assessment-stimulus-ref"));

/**
 * The documents whose root is a stimulus, the documents a stimulus ref names: one per
 * `(package, path)` by `Document`'s key over it ("Document entry").
 */
const stimulusDocuments = select(Document, (d) => d.eq(d.rootKind, "qti-assessment-stimulus"));

/**
 * The resolved references of `href` attributes, one per element by `ReferencePath`'s primary key,
 * its name fixed: the side Q5.13's item refs, section refs, stimulus refs and includes resolve
 * through.
 */
export const hrefPaths = select(ReferencePath, (p) => p.eq(p.name, "href"));

/**
 * Every statement over the package, its entries and the manifest's overlays, each `check` named by
 * its oracle law with spaces written as underscores:
 *
 * - **the entries:** the package's files, one per path, each its package's, and each exactly one of a
 *   document, its `Document`, and media, its {@link Media} with the digest of its bytes ("Entry
 *   kind", grizzle's `alternatives` over {@link EntryKind}).
 * - **the overlays:** each names a node of its kind by its key alone; a {@link File} and a
 *   {@link ResourceHref} stand exactly where their `href` is written, holding its resolution and no
 *   copy of it; and a file's resource is its node's parent, which `Node` holds. The manifest's
 *   identifier, the resources' identifiers, one per identifier, and a dependency's resource are
 *   queries (`#pantry/qti/overlay-queries/package.ts`).
 * - **P1 (spec reading 67):** a resource's type is one the content-packaging XSD enumerates, which
 *   the attribute's value domain states (`attribute-lexical`), and nothing here.
 * - **P2 `root-type-reverse` ("RootOfType"):** a document's (resource type, root kind) is a row of
 *   the set `RootOfType`, where it is a resource's, its {@link ResourceDocument} (an included
 *   fragment's type holds every kind an include stands for, spec reading 114); and every document
 *   is the manifest exactly where it is at the manifest's path, `imsmanifest.xml` (IMS Content
 *   Packaging 1.2, §6.3; spec reading 146), and otherwise one a resource names, of the type it
 *   names (spec reading 167).
 * - **P3 `file-listed` ("File listed"), `href-listed` ("Href listed") and `entry-kind` ("Document
 *   entry"):** every entry but the manifest is the resolved path of a file; a resource's href names
 *   the file one of its own files names, compared by resolved path in the package and as written
 *   outside it (reading 102); every document-typed href resolves in the package, to an entry, and
 *   names the one document there, of the href's type (reading 93), so a path with no entry, or one
 *   listed under two document types, is refused here and never under `root-type-reverse`. The
 *   halves of P2 and P3 that read a typed href are rules over the query `TypedHref`, stated under
 *   the same names in `#pantry/qti/queries.ts`, and "File listed" and "Href listed" are rules over
 *   the files' targets, stated in `#pantry/qti/overlay-queries/package.ts`.
 * - **P4, one identifier space:** no resource's identifier is its manifest's, and no two resources
 *   share one: each is an `xs:ID` of the manifest, so "DocumentId key", the key of the manifest's
 *   ID/IDREF table (`IdBinding` of `#pantry/qti/overlay-queries/identity.ts`, cvc-id clause 2),
 *   holds them distinct, as it holds every document's IDs, and nothing here restates it.
 * - **C17 ("E1 derived"):** a resource's type code is the one its `type`'s value spells, a join of
 *   the query `resourceTypes` (`#pantry/qti/queries.ts`) and no row; a document a resource lists
 *   has its {@link ResourceDocument}, its `Document`'s copy, and its document type is its resource
 *   type's (`ResourceDocumentType`), so the manifest alone has none; a path resolved in the package
 *   holds no dot segment ({@link resolvedPathPattern}); a reference is its written pieces, external
 *   where its target has a scheme or a leading `/`, and its own document's only where its target is
 *   empty, its pieces in order its attribute's lexical form or its element's string value (a rule
 *   over each join, `ReferenceLexical` and `TextReferenceStringValue` of
 *   `#pantry/qti/queries.ts`).
 * - **`href-form` ("Href form"), a stated limit:** no href, and no image candidate's URL of a
 *   `srcset`, is one the importer reads no name from (`unresolved`).
 * - **`include-href` ("Include fragment identifier"):** an `xi:include`'s href carries no fragment
 *   identifier, wherever its `#` stands in its params (XInclude 1.0 Second Edition, §3.1: "Fragment
 *   identifiers must not be used; their appearance is a fatal error"; spec reading 115). Its query
 *   is admitted and names no other file (reading 102).
 * - **the references:** every attribute of the reference census (`ReferenceAttribute`, spec reading 103)
 *   of the form `uri` is one {@link Reference}, at its attribute both ways; each resolved in the
 *   package has its {@link ReferencePath} and no other has one. Every `srcset` is one
 *   {@link Srcset}, the two mirrored at the element's place, its image candidates its ordered
 *   family, whose pieces concatenate to its form (a rule over the query `SrcsetForm`,
 *   `#pantry/qti/overlay-queries/package.ts`), and each candidate resolved in the package has its
 *   {@link CandidatePath}. Every element of the text census (`textReferenceKinds`, spec reading
 *   R9-b) is one {@link TextReference}, at its node both ways, with its {@link TextReferencePath}
 *   the same way.
 * - **`file-exists` ("File exists"):** a file's path resolved in the package is an entry's path (IMS
 *   Content Packaging 1.2, InterchangePackage (b)), and so is every resolved reference's path, an
 *   attribute's and a text's (d, R6).
 * - **`stimulus-ref-target` ("Stimulus ref target"):** a stimulus ref's href that resolves in the
 *   package names a document whose root is a stimulus (information model §7.6: the structure
 *   "enables reference to a 'qti-assessment-stimulus' instance", its href "The uri used to refer to
 *   the stimulus file"); an external one is not resolved (reading 35's reading of an absolute
 *   URI).
 * - **a dependency names a resource:** its collapsed `identifierref` is a collapsed resource
 *   identifier of its package (IMS Content Packaging 1.2, `dependency`, §6.11.5; decision 457 (3)),
 *   the resources' identifiers distinct per package, so it is resolved (the query
 *   `DependencyResolved`, "Dependency target"); and **`self-dependency` ("Self dependency"):** the
 *   resource it names is never its own, its node's parent (§6.11.5 B ii). Both are rules over that
 *   query, in `#pantry/qti/overlay-queries/package.ts`.
 */
export const packageLawsByName = {
  "E1 derived": [
    contained(
      on(ResourceDocument, "package", "path", "rootKind", "documentType"),
      on(Document, "package", "path", "rootKind", "documentType"),
    ),
    contained(
      on(
        select(Document, (d) => d.ne(d.documentType, "manifest")),
        "package",
        "path",
      ),
      on(ResourceDocument, "package", "path"),
    ),
    check("E1_derived", ResourceHref, (h) =>
      h.or(h.ne(h.scope, "entry"), Text.matches(h.target, resolvedPathPattern)),
    ),
    check("E1_derived", File, (f) =>
      f.or(f.ne(f.scope, "entry"), Text.matches(f.target, resolvedPathPattern)),
    ),
    check("E1_derived", Reference, (r) =>
      r.and(
        Text.matches(r.target, hrefPathPattern),
        r.or(r.not(Text.matches(r.target, externalHrefPattern)), r.eq(r.scope, "external")),
        r.or(r.ne(r.scope, "document"), r.eq(r.target, "")),
      ),
    ),
    check("E1_derived", ReferencePath, (p) => Text.matches(p.target, resolvedPathPattern)),
    check("E1_derived", TextReference, (r) =>
      r.and(
        Text.matches(r.target, hrefPathPattern),
        r.or(r.not(Text.matches(r.target, externalHrefPattern)), r.eq(r.scope, "external")),
        r.or(r.ne(r.scope, "document"), r.eq(r.target, "")),
      ),
    ),
    check("E1_derived", TextReferencePath, (p) => Text.matches(p.target, resolvedPathPattern)),
    ...tokenList(
      SrcsetCandidate,
      Srcset,
      check("E1_derived", SrcsetCandidate, (c) =>
        c.and(
          c.or(c.eq(c.at, 0n), Text.matches(c.lead, srcsetSeparator)),
          c.or(c.not(Text.matches(c.url, externalHrefPattern)), c.eq(c.scope, "external")),
          c.ne(c.scope, "document"),
        ),
      ),
    ),
    check("E1_derived", CandidatePath, (p) => Text.matches(p.target, resolvedPathPattern)),
  ],
  "Entry family": [contained(on(Entry, "package"), on(Package, "name"))],
  "Entry kind": [alternatives(Entry, "kind", EntryKind, { document: Document, media: Media })],
  "File exists": [
    contained(on(entryFiles, "package", "target"), on(Entry, "package", "path")),
    contained(on(ReferencePath, "package", "target"), on(Entry, "package", "path")),
    contained(on(TextReferencePath, "package", "target"), on(Entry, "package", "path")),
    contained(on(CandidatePath, "package", "target"), on(Entry, "package", "path")),
  ],
  "Href form": [
    check("Href_form", ResourceHref, (h) => h.ne(h.scope, "unresolved")),
    check("Href_form", File, (f) => f.ne(f.scope, "unresolved")),
    check("Href_form", Reference, (r) => r.ne(r.scope, "unresolved")),
    check("Href_form", SrcsetCandidate, (c) => c.ne(c.scope, "unresolved")),
    check("Href_form", TextReference, (r) => r.ne(r.scope, "unresolved")),
  ],
  "Include fragment identifier": [
    check("Include_fragment_identifier", Reference, (r) =>
      r.or(r.ne(r.kind, includeKind), r.not(Text.matches(r.params, fragmentMark))),
    ),
  ],
  "Manifest overlay": [
    mirrors(
      on(resourceHrefs, "package", "path", "start"),
      on(ResourceHref, "package", "path", "start"),
    ),
    contained(
      on(ResourceHref, "package", "path", "start"),
      on(nodesOf("cp:resource"), "package", "path", "start"),
    ),
    contained(
      on(File, "package", "path", "start"),
      on(nodesOf("cp:file"), "package", "path", "start"),
    ),
    contained(on(fileHrefs, "package", "path", "start"), on(File, "package", "path", "start")),
  ],
  "Reference overlay": [
    contained(
      on(censusAttributes, "package", "path", "start", "name", "kind"),
      on(Reference, "package", "path", "start", "name", "kind"),
    ),
    contained(
      on(Reference, "package", "path", "start", "name"),
      on(censusAttributes, "package", "path", "start", "name"),
    ),
    contained(
      on(entryReferences, "package", "path", "start", "name", "kind"),
      on(ReferencePath, "package", "path", "start", "name", "kind"),
    ),
    contained(
      on(ReferencePath, "package", "path", "start", "name", "kind"),
      on(entryReferences, "package", "path", "start", "name", "kind"),
    ),
    contained(
      on(textReferenceNodes, "package", "path", "start", "kind"),
      on(TextReference, "package", "path", "start", "kind"),
    ),
    contained(
      on(TextReference, "package", "path", "start"),
      on(textReferenceNodes, "package", "path", "start"),
    ),
    contained(
      on(entryTextReferences, "package", "path", "start", "kind"),
      on(TextReferencePath, "package", "path", "start", "kind"),
    ),
    contained(
      on(TextReferencePath, "package", "path", "start", "kind"),
      on(entryTextReferences, "package", "path", "start", "kind"),
    ),
    mirrors(
      on(srcsetAttributes, "package", "path", "start"),
      on(Srcset, "package", "path", "start"),
    ),
    mirrors(
      on(entryCandidates, "package", "path", "start", "at"),
      on(CandidatePath, "package", "path", "start", "at"),
    ),
  ],
  RootOfType: [
    check("RootOfType", Document, (d) =>
      d.or(
        d.and(d.eq(d.documentType, "manifest"), d.eq(d.path, manifestPath)),
        d.and(d.ne(d.documentType, "manifest"), d.ne(d.path, manifestPath)),
      ),
    ),
    contained(on(ResourceDocument, "type", "rootKind"), on(RootOfType, "type", "root")),
  ],
  "Stimulus ref target": [
    contained(on(stimulusPaths, "package", "target"), on(stimulusDocuments, "package", "path")),
  ],
} as const;

/**
 * {@link packageLawsByName}'s statements in one list, the module's laws as the schema composes them.
 */
export const packageLaws = Object.values(packageLawsByName).flat();

/**
 * `package.ts`'s relations: the package, its entries and their kinds, its media's digests, the
 * manifest's resources' identifiers and the resolutions of its resources' and files' hrefs, and
 * each document's references with the entries they resolve to, each href's outcome read under the
 * `HrefScope` roster.
 */
export const packageRelations = [
  CandidatePath,
  Entry,
  EntryKind,
  File,
  HrefScope,
  Media,
  Package,
  Reference,
  ReferencePath,
  ResourceDocument,
  ResourceHref,
  Srcset,
  SrcsetCandidate,
  TextReference,
  TextReferencePath,
] as const;
