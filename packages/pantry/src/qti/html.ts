/**
 * The HTML element laws (spec readings 124 to 126; Aiden's review of PR #46, items 6 to 8 and L3):
 * what the information model asks of a `source`, a `track` and a table cell's `headers` beyond the
 * XSD, whose attributes there are all optional. Where the two differ, the stricter source is the
 * rule (readings 16 and 17).
 *
 * - **Reading 124** (rules `source-srcset` and `source-src`): a `source` in a `picture` carries
 *   `srcset` ("This attribute is required when 'source' is used in 'picture'", info §5.135.3), and
 *   one in an `audio` or a `video` carries `src`. §5.135.1's "This characteristic must be present"
 *   is read in a media element alone, as the HTML Standard it restates splits it: there "The src
 *   attribute must be present", and in a `picture` "The src attribute must not be present". A
 *   `source` elsewhere (a template's content, a wildcard's) is bound by neither.
 * - **Reading 125** (rule `track-srclang`): a `track` in the subtitles state carries `srclang` (info
 *   §5.163.3). §5.163.1 maps `kind`'s keywords to HTML's states and states no default, so a `track`
 *   with no `kind` is in HTML's missing value default, the subtitles state. `kind`'s domain is an
 *   enumeration under whiteSpace `preserve`, so a written `kind` is in the subtitles state exactly
 *   where its lexical form is `subtitles`, and AL1's lexical half refuses every other form.
 * - **Reading 126** (rule `table-headers`): each token of a `td`'s or a `th`'s `headers` is the ID of
 *   a `th` that takes part in the cell's table, and the tokens are unique ("an unordered set of
 *   unique space-separated tokens that are case-sensitive, each of which must have the value of an
 *   ID of a 'th' tag taking part in the same table as the 'td' or 'th' tag", info §5.140.1). A
 *   cell's table is its nearest `table`, nested tables included ({@link TableScope}); a cell no
 *   `table` holds takes part in no table, so none of its tokens names a header.
 *
 * Reading 124 and the missing-`kind` half of reading 125 are presence laws, AL3's pattern: a row
 * check on `Node` that a slot is in `attrs`, the fold of its attributes' slots (AL2). Each is its
 * own check, so each refusal names its own law. A written `kind` is a value, which `attrs` does not
 * hold, so the other half is a containment between two `Attribute` selections. That a value is a
 * valid non-empty URL, and `srclang` a BCP 47 tag, is each attribute's value domain (AL1's lexical
 * half, readings 124, 125 and 129).
 *
 * No overlay copies a cell's `headers` (C18): {@link CellHeaders} holds its parse alone, at the
 * attribute's element both ways, and the parse is held to the lexical form it reads where the form
 * stands, `Attribute`'s (`#pantry/qti/overlay-queries/html.ts`). A `th`'s `id` has its
 * {@link TableHeader}, from `attributesOf` into the overlay, keyed by `Attribute`'s own key,
 * `(package, path, start, name)` (`#pantry/qti/attributes.ts`); it lies inside the ID-typed
 * attributes (`idAttributes` of `#pantry/qti/identity.ts`), which the key over them holds to one
 * per element, and the way back meets them at the `th` kind ({@link thIdAttributes}). Every overlay
 * is keyed by its element, `(package, path, start)`, and names another element of its document by
 * its position. Every copied text that takes part in a cross-row equality is of its type's bound in
 * a key (`#pantry/qti/limits.ts`), so a key, a containment's target and a lookup hold it as itself.
 * Every
 * check is named by its oracle law (`#pantry/test/oracle.ts` `LawName`) with spaces written as
 * underscores.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Source | QTI 3.0 information model, §5.135 Source}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Track | QTI 3.0 information model, §5.163 Track}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_TDH | QTI 3.0 information model, §5.140 TDH}
 * @see {@link https://html.spec.whatwg.org/multipage/embedded-content.html#the-source-element | HTML, the source element}
 * @see {@link https://html.spec.whatwg.org/multipage/media.html#the-track-element | HTML, the track element}
 * @see {@link https://html.spec.whatwg.org/multipage/tables.html#attr-tdth-headers | HTML, the headers attribute}
 */
import { check, contained, key, mirrors, natural, on, relation, select } from "@bjornpagen/grizzle";
import { Attribute, attributesOf, carries } from "#pantry/qti/attributes.ts";
import { thIdAttributes } from "#pantry/qti/identity.ts";
import { EntryPath, PackageName, XmlId } from "#pantry/qti/limits.ts";
import { Node } from "#pantry/qti/node.ts";
import {
  listTokens,
  tokenFields,
  tokenList,
  tokenTextDigest,
  whitespaceTokens,
} from "#pantry/qti/token-list.ts";
import { cellKinds } from "#pantry/vocab/terms/html.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * The kinds of the media elements, whose `source` children carry `src` (reading 124).
 */
const mediaKinds = ["audio", "video"] as const;

/**
 * One element on the way from a table cell an overlay reads up to the table it takes part in, keyed
 * by the element: `table`, the position of its nearest `table`, itself included, or of the document
 * node for an element no `table` holds. A `table` is its own table, a document's root the
 * document's where it is no `table`, and every other element its parent's, so a cell's table is
 * read up the tree with no copy on `Node`, as `identity.ts`'s `SsmlScope` reads an SSML fragment.
 * The element's kind and parent are its node's, which the scope's laws read through `Node`
 * (`#pantry/qti/overlay-queries/html.ts`).
 */
export const TableScope = relation(
  "TableScope",
  { package: PackageName, path: EntryPath, start: natural, table: natural },
  ["package", "path", "start"],
);

/**
 * One table cell's `headers`, keyed by the cell: the owner of the attribute's parse, which holds no
 * copy of its lexical form (C18).
 *
 * - **the attribute's element:** `package`, `path` and `start`;
 * - **drawn:** `tokens`, its {@link HeaderToken} count;
 * - **accumulated:** `tokenText`, the end of its tokens' concatenation, which "E1 derived" holds to
 *   the attribute's lexical form where it stands (`#pantry/qti/overlay-queries/html.ts`);
 * - **generated:** `tokenTextDigest`, its digest, the fold's end on the family's last axis.
 *
 * Its table is its cell's {@link TableScope}, which "Table headers" reads through a query.
 */
export const CellHeaders = relation.generated(
  "CellHeaders",
  {
    package: PackageName,
    path: EntryPath,
    start: natural,
    tokenText: tokenFields.piecesWas,
    tokens: tokenFields.at,
  },
  ["package", "path", "start"],
  (c) => tokenTextDigest(c),
);

/**
 * One token of a cell's `headers`, in order, with the whitespace written before and after it, so
 * its `piece` is a stretch of the value and the pieces concatenate to it: a whitespace list's token
 * (`#pantry/qti/token-list.ts`), its family's group the cell's.
 *
 * The tokens are a set (reading 126: "an unordered set of unique space-separated tokens"), which
 * the key over `(package, path, start, token)` holds; the order is the lexical form's, the order of
 * its stretches, which the concatenation that proves the split against the value reads.
 *
 * Its cell's table is the cell's {@link TableScope}, which "Table headers" reads through a query.
 */
export const HeaderToken = listTokens("HeaderToken");

/**
 * One `th` that carries an ID, keyed by the `th`: its `id`, the ID's value as `IdValue`
 * (`#pantry/qti/names.ts`) holds it (an `xs:ID` collapsed), with `owner` its own position, an
 * attribute ID's binding, so its copy shares the superkey `PlacedId` reads. Its table is its
 * {@link TableScope}'s, which "Table headers" and its key read through a query.
 */
export const TableHeader = relation(
  "TableHeader",
  {
    id: XmlId,
    owner: natural,
    package: PackageName,
    path: EntryPath,
    start: natural,
  },
  ["package", "path", "start"],
);

/**
 * Every relation this module declares, in one list, as `schema.ts` composes them.
 */
export const htmlRelations = [CellHeaders, HeaderToken, TableHeader, TableScope] as const;

/**
 * Reading 124's picture half (law "Picture source srcset", rule `source-srcset`; info §5.135.3:
 * "This attribute is required when 'source' is used in 'picture'"): a `source` whose parent is a
 * `picture` carries `srcset`.
 */
const pictureSourceSrcset = check("Picture_source_srcset", Node, (n) =>
  n.or(n.ne(n.kind, "source"), n.ne(n.parentKind, "picture"), carries(n, "srcset")),
);

/**
 * Reading 124's media half (law "Media source src", rule `source-src`; info §5.135.1: "This
 * characteristic must be present", read in a media element as HTML states it): a `source` whose
 * parent is an `audio` or a `video` carries `src`.
 */
const mediaSourceSrc = check("Media_source_src", Node, (n) =>
  n.or(n.ne(n.kind, "source"), n.not(n.in(n.parentKind, mediaKinds)), carries(n, "src")),
);

/**
 * Reading 125's missing value default (law "Track srclang", rule `track-srclang`): a `track` that
 * writes no `kind` is in the subtitles state, so it carries `srclang`.
 */
const defaultTrackSrclang = check("Track_srclang", Node, (n) =>
  n.or(n.ne(n.kind, "track"), carries(n, "kind"), carries(n, "srclang")),
);

/**
 * A `track`'s `kind` written as `subtitles`, the one lexical form of the subtitles state.
 */
const subtitleKinds = select(Attribute, (a) =>
  a.and(a.eq(a.kind, "track"), a.eq(a.name, "kind"), a.eq(a.lexical, "subtitles")),
);

/**
 * A `track`'s `srclang`, one per element.
 */
const trackSrclangs = select(Attribute, (a) =>
  a.and(a.eq(a.kind, "track"), a.eq(a.name, "srclang")),
);

/**
 * Reading 125's written state (law "Track srclang", rule `track-srclang`; info §5.163.3: "This
 * attribute must be present if the tag's kind attribute is in the subtitles state"): a `track`
 * whose `kind` is `subtitles` carries `srclang`.
 */
export const subtitleTrackSrclang = contained(
  on(subtitleKinds, "package", "path", "start"),
  on(trackSrclangs, "package", "path", "start"),
);

/**
 * A table cell's `headers`, each with its {@link CellHeaders} row.
 */
const headersAttributes = attributesOf("headers", cellKinds);

/**
 * A `th`'s `id`, one of its document's IDs, the source of {@link TableHeader}: AL1 holds its form
 * to its domain, an `xs:ID`, an NCName once collapsed (spec readings 152 and 156).
 */
const headerIds = attributesOf("id", ["th"]);

/**
 * Every statement over the HTML overlays, each `check` named by its oracle law:
 *
 * - **Reading 124:** {@link pictureSourceSrcset} and {@link mediaSourceSrc};
 * - **Reading 125:** {@link defaultTrackSrclang}, and {@link subtitleTrackSrclang}, whose target, the
 *   `srclang` selection, is keyed by `Attribute`'s own key at its fixed name
 *   (`#pantry/qti/attributes.ts`);
 * - **TableScope:** each scope at a node; a `table` its own table, a root that is no `table` the
 *   document's and every other element its parent's, which read the node's kind and parent and so
 *   are rules over a query (`#pantry/qti/overlay-queries/html.ts`);
 * - **CellHeaders:** a row for each cell's `headers` and for no other element (both ways), at its
 *   scope; its tokens a family, each token a maximal run of no whitespace (`E1_derived`), whose
 *   concatenation the attribute's lexical form is, or none for a form of whitespace alone, a rule
 *   over a query that reads the form where it stands (`#pantry/qti/overlay-queries/html.ts`);
 * - **TableHeader:** each `th`'s `id` with its row, both ways, the way back an ID-typed attribute of
 *   a `th` at its node, since a `th`'s one ID-typed attribute is its `id`
 *   (`#pantry/qti/identity.copyback.test.ts`); at its scope; its value and owner the ID's, a rule
 *   over a query over `IdValue` (`#pantry/qti/overlay-queries/html.ts`);
 * - **Reading 126:** a cell's tokens unique; and, through its cell's and its header's scope, which is
 *   a rule over a query (`#pantry/qti/overlay-queries/html.ts`), each token the `id` of a `th`
 *   taking part in the cell's table, and one header per (table, id) among those in a table
 *   ("DocumentId key"), which an ID held twice in a document already breaks.
 */
export const htmlLawsByName = {
  "E1 derived": declared("E1 derived", [
    contained(on(TableScope, "package", "path", "start"), on(Node, "package", "path", "start")),
    mirrors(
      on(headersAttributes, "package", "path", "start"),
      on(CellHeaders, "package", "path", "start"),
    ),
    contained(
      on(CellHeaders, "package", "path", "start"),
      on(TableScope, "package", "path", "start"),
    ),
    ...tokenList(HeaderToken, CellHeaders, whitespaceTokens(HeaderToken)),
    contained(
      on(headerIds, "package", "path", "start"),
      on(TableHeader, "package", "path", "start"),
    ),
    contained(
      on(TableHeader, "package", "path", "start"),
      on(thIdAttributes, "package", "path", "start"),
    ),
    check("E1_derived", TableHeader, (h) => h.eq(h.owner, h.start)),
    contained(
      on(TableHeader, "package", "path", "start"),
      on(TableScope, "package", "path", "start"),
    ),
  ]),
  "Media source src": declared("Media source src", [mediaSourceSrc]),
  "Picture source srcset": declared("Picture source srcset", [pictureSourceSrcset]),
  "Table headers": declared("Table headers", [
    key(on(HeaderToken, "package", "path", "start", "token")),
  ]),
  "Track srclang": declared("Track srclang", [defaultTrackSrclang, subtitleTrackSrclang]),
} as const;

/**
 * {@link htmlLawsByName}'s statements in one list, the module's laws as the schema composes them.
 */
export const htmlLaws = Object.values(htmlLawsByName).flat();
