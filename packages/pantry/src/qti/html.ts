/**
 * The HTML element laws (spec readings `source-attributes`, `track-srclang` and `cell-headers`;
 * Aiden's review of PR #46, items 6 to 8 and L3): what the information model asks of a `source`, a
 * `track` and a table cell's `headers` beyond the XSD, whose attributes there are all optional.
 * Where the two differ, the stricter source is the rule (readings `normal-maximum-positive` and
 * `rubric-view-list`).
 *
 * - **Reading `source-attributes`** (rules `source-srcset` and `source-src`): a `source` in a
 *   `picture` carries `srcset` ("This attribute is required when 'source' is used in 'picture'",
 *   info §5.135.3), and one in an `audio` or a `video` carries `src`. §5.135.1's "This
 *   characteristic must be present" is read in a media element alone, as the HTML Standard it
 *   restates splits it: there "The src attribute must be present", and in a `picture` "The src
 *   attribute must not be present". A `source` elsewhere (a template's content, a wildcard's) is
 *   bound by neither.
 * - **Reading `track-srclang`** (rule `track-srclang`): a `track` in the subtitles state carries
 *   `srclang` (info §5.163.3). §5.163.1 maps `kind`'s keywords to HTML's states and states no
 *   default, so a `track` with no `kind` is in HTML's missing value default, the subtitles state.
 *   `kind`'s domain is an enumeration under whiteSpace `preserve`, so a written `kind` is in the
 *   subtitles state exactly where its lexical form is `subtitles`, and AL1's lexical half refuses
 *   every other form.
 * - **Reading `cell-headers`** (rule `table-headers`): each token of a `td`'s or a `th`'s `headers`
 *   is the ID of a `th` that takes part in the cell's table, and the tokens are unique ("an
 *   unordered set of unique space-separated tokens that are case-sensitive, each of which must have
 *   the value of an ID of a 'th' tag taking part in the same table as the 'td' or 'th' tag", info
 *   §5.140.1). A cell's table is its nearest `table`, nested tables included (`CellTable`); a cell
 *   no `table` holds takes part in no table, so none of its tokens names a header.
 *
 * Reading `source-attributes` and the missing-`kind` half of reading `track-srclang` are presence
 * laws, AL3's pattern: a row check on `Node` that a slot is in `attrs`, the fold of its attributes'
 * slots (AL2). Each is its own check, so each refusal names its own law. A written `kind` is a
 * value, which `attrs` does not hold, so the other half is a containment between two `Attribute`
 * selections. That a value is a valid non-empty URL, and `srclang` a BCP 47 tag, is each
 * attribute's value domain (AL1's lexical half, readings `source-attributes`, `track-srclang` and
 * `language-tags`).
 *
 * Reading `cell-headers` reads views of `Attribute` and `Node`, each a projection no row copies
 * (C18), so its laws are rules over a query (`#pantry/qti/overlay-queries/html.ts`): each cell's
 * `headers` split into its tokens (`HeaderToken`), each cell's nearest table (`CellTable`) and each
 * tabled `th`'s `id` beside its table (`TableHeader`). Every check is named by its oracle law
 * (`#pantry/test/oracle.ts` `LawName`) with spaces written as underscores.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Source | QTI 3.0 information model, §5.135 Source}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Track | QTI 3.0 information model, §5.163 Track}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_TDH | QTI 3.0 information model, §5.140 TDH}
 * @see {@link https://html.spec.whatwg.org/multipage/embedded-content.html#the-source-element | HTML, the source element}
 * @see {@link https://html.spec.whatwg.org/multipage/media.html#the-track-element | HTML, the track element}
 * @see {@link https://html.spec.whatwg.org/multipage/tables.html#attr-tdth-headers | HTML, the headers attribute}
 */
import { check, contained, on, select } from "@bjornpagen/grizzle";
import { Attribute, carries } from "#pantry/qti/attributes.ts";
import { Node } from "#pantry/qti/node.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * The kinds of the media elements, whose `source` children carry `src` (reading
 * `source-attributes`).
 */
const mediaKinds = ["audio", "video"] as const;

/**
 * Reading `source-attributes`'s picture half (law "Picture source srcset", rule `source-srcset`;
 * info §5.135.3: "This attribute is required when 'source' is used in 'picture'"): a `source` whose
 * parent is a `picture` carries `srcset`.
 */
const pictureSourceSrcset = check("Picture_source_srcset", Node, (n) =>
  n.or(n.ne(n.kind, "source"), n.ne(n.parentKind, "picture"), carries(n, "srcset")),
);

/**
 * Reading `source-attributes`'s media half (law "Media source src", rule `source-src`; info
 * §5.135.1: "This characteristic must be present", read in a media element as HTML states it): a
 * `source` whose parent is an `audio` or a `video` carries `src`.
 */
const mediaSourceSrc = check("Media_source_src", Node, (n) =>
  n.or(n.ne(n.kind, "source"), n.not(n.in(n.parentKind, mediaKinds)), carries(n, "src")),
);

/**
 * Reading `track-srclang`'s missing value default (law "Track srclang", rule `track-srclang`): a
 * `track` that writes no `kind` is in the subtitles state, so it carries `srclang`.
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
 * Reading `track-srclang`'s written state (law "Track srclang", rule `track-srclang`; info
 * §5.163.3: "This attribute must be present if the tag's kind attribute is in the subtitles
 * state"): a `track` whose `kind` is `subtitles` carries `srclang`.
 */
export const subtitleTrackSrclang = contained(
  on(subtitleKinds, "package", "path", "start"),
  on(trackSrclangs, "package", "path", "start"),
);

/**
 * Every statement over the HTML elements' nodes and attributes, each `check` named by its oracle
 * law:
 *
 * - **Reading `source-attributes`:** {@link pictureSourceSrcset} and {@link mediaSourceSrc};
 * - **Reading `track-srclang`:** {@link defaultTrackSrclang}, and {@link subtitleTrackSrclang}, whose
 *   target, the `srclang` selection, is keyed by `Attribute`'s own key at its fixed name
 *   (`#pantry/qti/attributes.ts`).
 *
 * Reading `cell-headers`'s laws read views, so they are rules over a query
 * (`#pantry/qti/overlay-queries/html.ts`).
 */
export const htmlLawsByName = {
  "Media source src": declared("Media source src", [mediaSourceSrc]),
  "Picture source srcset": declared("Picture source srcset", [pictureSourceSrcset]),
  "Track srclang": declared("Track srclang", [defaultTrackSrclang, subtitleTrackSrclang]),
} as const;

/**
 * {@link htmlLawsByName}'s statements in one list, the module's laws as the schema composes them.
 */
export const htmlLaws = Object.values(htmlLawsByName).flat();
