/**
 * The manifest's overlay rows (plan §1.6, §C's `rowsOf`), each document's reference rows
 * (`referenceRowsOf`), and the one resolver of an href the importer has (`resolveIn`): from a
 * document's view (`DocumentView` of `#pantry/import/fold.ts`), the rows of every overlay
 * `#pantry/qti/package.ts` declares, each relation's rows a keyed set.
 *
 * The rows restate what the tree says: each overlay copies its node's tuple as the tree's own rows
 * give it (`flatten` of `#pantry/model/xdm.ts`), and each href its resolution, never its form,
 * which its `Attribute` row holds alone (C18). The manifest's and the resources' identifiers, a
 * resource's type and a dependency's resource are the database's queries over `Attribute`, never
 * rows (`#pantry/qti/overlay-queries/package.ts`). The database proves every row (`packageLaws`),
 * so a row this builder gets wrong is refused, never accepted.
 *
 * Every href is resolved here before a row is written (readings 102 and 103): its value read in
 * its attribute's whitespace class, the class `Attribute.value` normalizes it in (`valueReadingOf`
 * of `#pantry/import/names.ts`), its path merged with its base, the `xml:base` in scope or its
 * document's own path, its dot segments removed, and each segment percent-decoded (RFC 3986, §2.1,
 * §5.2 and §6.2.2.2). No relation can percent-decode a name, so the database holds the outcome and
 * compares it with the entries, and the law oracle's own resolver (`#pantry/test/resolution.ts`)
 * is the differential that holds this one to RFC 3986.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc3986#section-5.2 | RFC 3986, §5.2}
 */
import { regex } from "arkregex";
import type { Addition } from "@bjornpagen/grizzle";
import { resolveWithin } from "@bjornpagen/grizzle-text/uri";
import { Option, Result } from "effect";
import { normalizedIn } from "#pantry/grammar/domains.ts";
import type { WhiteSpaceClass } from "#pantry/grammar/domains.ts";
import { documentTypes, grammar, ResourceType } from "#pantry/grammar/install.ts";
import { textReferenceKinds } from "#pantry/grammar/references.ts";
import type { ReferenceForm } from "#pantry/grammar/references.ts";

import { governorOf } from "#pantry/import/fold.ts";
import type { DocumentView, FlatDocument } from "#pantry/import/fold.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import { valueAt, valueReadingOf } from "#pantry/import/names.ts";
import { hrefPiecesOf, piecesOf, srcsetCandidatesOf } from "#pantry/import/pieces.ts";
import type { HrefPieces, Space } from "#pantry/import/pieces.ts";
import type { Place } from "#pantry/qti/schema.ts";
import { stringValuesOf } from "#pantry/import/overlays/string-values.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { NodeRow } from "#pantry/model/xdm.ts";
import type {
  CandidatePath,
  File,
  FileOutside,
  FilePath,
  Package,
  Reference,
  ReferencePath,
  ResourceHref,
  ResourceHrefOutside,
  ResourceHrefPath,
  Srcset,
  SrcsetCandidate,
  TextReference,
  TextReferencePath,
} from "#pantry/qti/package.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";

/**
 * Where a manifest stands, as this builder reads it beside the manifest's view: its package's name,
 * the part of the importer's `DocumentPlace` (Q5.15) it needs.
 */
export interface ManifestIds {
  readonly package: Addition<typeof Package>["package"];
}

/**
 * The manifest's overlay rows, one keyed set per relation: each map from the text of a row's key
 * to the row as its writer writes it, the key's values in key order as a JSON array.
 */
export interface PackageRows {
  readonly File: ReadonlyMap<string, Addition<typeof File>>;
  readonly FileOutside: ReadonlyMap<string, Addition<typeof FileOutside>>;
  readonly FilePath: ReadonlyMap<string, Addition<typeof FilePath>>;
  readonly ResourceHref: ReadonlyMap<string, Addition<typeof ResourceHref>>;
  readonly ResourceHrefOutside: ReadonlyMap<string, Addition<typeof ResourceHrefOutside>>;
  readonly ResourceHrefPath: ReadonlyMap<string, Addition<typeof ResourceHrefPath>>;
}

/**
 * The manifest overlays of a document that is not its package's manifest: none. The package's
 * manifest is its one `imsmanifest.xml` (IMS Content Packaging 1.2), so a `cp:*` element of any
 * other document describes no part of the package: what refuses it is the content laws over its
 * own node (its root's resource type, its required attributes), never a manifest overlay's key or
 * copy, one cause, one rule.
 */
export const noPackageRows: PackageRows = {
  File: new Map(),
  FileOutside: new Map(),
  FilePath: new Map(),
  ResourceHref: new Map(),
  ResourceHrefOutside: new Map(),
  ResourceHrefPath: new Map(),
};

/**
 * The `ResourceType` handle a `cp:resource`'s `type` names: every handle but the null object is
 * spelled exactly as its lexical form (C17).
 */
type ResourceTypeHandle = (typeof ResourceType.handles)[number];

/**
 * The `ResourceType` handles, each by the lexical form that spells it (`ResourceTypeLexical`).
 */
const spelledTypes: ReadonlyMap<string, ResourceTypeHandle> = new Map(
  ResourceType.handles.map((handle) => [handle, handle] as const),
);

/**
 * The resource types a resource names a document of, `RootOfType`'s key set.
 */
const documentTyped: ReadonlySet<string> = new Set(documentTypes);

/**
 * Read the code of a resource's `type` from its lexical form, as written: the attribute's type is
 * an `xs:string` enumeration, whose whitespace is preserved (XSD 1.1 Part 2, §4.3.6).
 *
 * @param lexical - The `type` attribute's lexical form, as written.
 * @returns The handle it spells; none for a form no handle spells, which has no code anywhere and
 *   which the attribute's value domain refuses as `attribute-lexical` alone (spec reading 67).
 */
const typeOf = (lexical: string): Option.Option<ResourceTypeHandle> =>
  Option.fromUndefinedOr(spelledTypes.get(lexical));

/**
 * A reference's written pieces, `lexical = lead ‖ target ‖ params ‖ trail`.
 */
interface ReferencePieces {
  readonly lead: Space;
  readonly params: HrefPieces["params"];
  readonly target: string;
  readonly trail: Space;
}

/**
 * Split a reference's lexical form into the pieces `Reference` holds: its leading and trailing XML
 * whitespace ({@link piecesOf}), and between them its path and its query or fragment
 * ({@link hrefPiecesOf}).
 *
 * @param lexical - The attribute's lexical form.
 * @returns `lead ‖ target ‖ params ‖ trail`, the lexical form.
 */
export const referencePiecesOf = (lexical: string): ReferencePieces => {
  const { lead, trail, value } = piecesOf(lexical);
  const { params, path } = hrefPiecesOf(value);

  return { lead, params, target: path, trail };
};

/**
 * Read the text an href resolves from: its value, as its attribute's type reads it (XML Schema
 * Part 2, §4.3.6; `Attribute.value`, `valueAt` of `#pantry/import/names.ts`) or as a text census
 * element's class reads its text, with the XML whitespace around it set aside. The value is already
 * read in its class; the trim is no second class but HTML's reading of a URL attribute's value as
 * "a valid URL potentially surrounded by spaces" (HTML, "URLs"), which the `replace`-class URL
 * attributes (`URLDType`, an `xs:normalizedString`; HTML's `src` and `poster`) and the
 * `preserve`-class `object@data` (`xs:string`) may hold around the URL. On an `xs:anyURI` (every
 * QTI `href` and `xml:base`), whose `collapse` leaves no whitespace at either end, it does nothing.
 *
 * @param value - The href's value.
 * @returns It, with no tab, line feed, carriage return or space at either end.
 */
export const hrefTextOf = (value: string): string =>
  value.replace(regex("^[\t\n\r ]+", "u"), "").replace(regex("[\t\n\r ]+$", "u"), "");

/**
 * Why the importer reads no name from an href, each a stated limit of the representation, refused
 * under "Href form" (reading 102), never under a law of QTI or Content Packaging:
 *
 * - `percent`: a `%` that starts no percent-encoding (`a%zz.png`, a `%` at the end). RFC 3986, §2.1,
 *   gives such a `%` no octet, so the path names nothing; the URL Standard keeps it as written, as
 *   a validation error. An `xs:anyURI`'s value domain refuses it first.
 * - `octets`: percent-encoded octets that spell no UTF-8 (`%FF`, `%C3` alone). XLink's escaping
 *   writes a name's characters as their UTF-8 octets (RFC 3986, §2.5), and an entry's path is
 *   Unicode text, so the octets name no entry this representation can compare: the file they name
 *   depends on the archive's own name encoding (a zip without its UTF-8 flag names in code page
 *   437).
 * - `separator`: a segment that decodes to a `/` or U+0000 (`a%2Fb.png`, `%00`). An encoded `/` is
 *   data within its segment (RFC 3986, §2.2), naming a file whose name holds `/`, and a resolved
 *   path is one text whose segments are separated by `/`, so it cannot hold that segment apart;
 *   PostgreSQL text holds no U+0000.
 * - `backslash`: a `\` in the path. XLink's escaping makes it the name's octet `%5C`, and the URL
 *   Standard reads it as `/` in a URL of a special scheme, so the two sources an href answers to
 *   name different files by it.
 * - `control`: a tab, line feed or carriage return the attribute's type preserves inside the path
 *   (`object@data`, an `xs:string`). XLink's escaping makes it a name's octet, and the URL Standard
 *   removes it from the URL.
 * - `colon`: a `:` in the first segment of a path with no scheme (`1:a.png`). RFC 3986, §4.2, makes
 *   it no relative reference ("would be mistaken for a scheme name"), and the URL Standard reads it
 *   as a path.
 *
 * A `srcset` meets these limits by each image candidate's URL, which the importer resolves as one
 * href (`srcsetCandidatesOf` of `#pantry/import/pieces.ts`).
 */
export type Limit = "backslash" | "colon" | "control" | "octets" | "percent" | "separator";

/**
 * How an href resolves, the `HrefScope` its row holds (`#pantry/qti/package.ts`): in the
 * package, to the entry path it names; outside it; to its own document; or not at all, under a
 * {@link Limit}.
 */
export type HrefResolution =
  | { readonly path: string; readonly scope: "entry" }
  | { readonly scope: "document" | "external" }
  | { readonly limit: Limit; readonly scope: "unresolved" };

/**
 * The base an element's hrefs resolve against (RFC 3986, §5.1; `xml:base`, xml.xsd: "provides a
 * URI to be used as the base for interpreting any relative URIs in the scope of the element on
 * which it appears; its value is inherited"): a path in the package, as its segments in their
 * written form, the last its file's name or empty for a directory; a location outside the package;
 * or a base the importer reads no path from, under its {@link Limit}.
 */
type HrefBase =
  | { readonly _tag: "package"; readonly segments: readonly string[] }
  | { readonly _tag: "external" }
  | { readonly _tag: "unresolved"; readonly limit: Limit };

/**
 * A URI's scheme at the start of an href (RFC 3986, §3.1): `ALPHA *( ALPHA / DIGIT / "+" / "-" /
 * "." ) ":"`.
 */
const schemeStart = regex("^[A-Za-z][A-Za-z0-9+.-]*:", "u");

/**
 * A `%` that starts no percent-encoding, `"%" HEXDIG HEXDIG` (RFC 3986, §2.1).
 */
const strayPercent = regex("%(?![0-9A-Fa-f]{2})", "u");

/**
 * A segment made of dots alone, each written as `.` or as its percent-encoding `%2E`, an
 * unreserved character, which RFC 3986, §2.3 and §6.2.2.2, reads as the character itself.
 */
const dotsOnly = regex("^(?:\\.|%2[Ee])+$", "u");

/**
 * Write an entry path's segment, a name, in the written form a base's segments are held in, a
 * URI's path segment (RFC 3986, §3.3): each `%` as `%25`, and each `?` and `#`, which an entry's
 * name may hold and a URI reads as its query's and its fragment's start, as `%3F` and `%23`, so
 * that decoding the segment gives the name back.
 *
 * @param name - The segment, as the entry's path holds it.
 * @returns Its written form.
 */
const writtenNameOf = (name: string): string =>
  name.replaceAll("%", "%25").replaceAll("?", "%3F").replaceAll("#", "%23");

/**
 * The base of a document's hrefs where no `xml:base` is in scope: the document's own path in the
 * package (RFC 3986, §5.1.3, the URI it was retrieved from), the manifest's directory being the
 * package root.
 *
 * @param path - The document's path, an entry's.
 * @returns Its base.
 */
export const documentBase = (path: string): HrefBase => ({
  _tag: "package",
  segments: path.split("/").map(writtenNameOf),
});

/**
 * A segment made of dots alone written as RFC 3986's dot segment, each `%2E` as the `.` it encodes
 * (§2.3 and §6.2.2.2 read an unreserved character's encoding as the character itself), so that
 * resolution removes it as `.` or `..`; any other segment as written.
 *
 * @param segment - The segment, written.
 * @returns The segment, its dots decoded where it is made of dots alone.
 */
const dotsDecodedOf = (segment: string): string =>
  dotsOnly.test(segment) ? segment.replaceAll(regex("%2[Ee]", "gu"), ".") : segment;

/**
 * The package's root as the absolute URI a reference is resolved against (RFC 3986, §5.1): a scheme
 * no href is read under, since an href with a scheme is external before it is resolved, and an
 * empty authority, so the package root is its path's root, as `file:///` roots a file system, and
 * a base whose first segment is empty is still a path, never an authority.
 */
const packageUri = "package:///";

/**
 * Name the limit a written path meets before it is merged, if any: a stray `%`, a backslash, a
 * tab, line feed or carriage return, or a `:` in its first segment.
 *
 * @param path - The path piece of an href with no scheme.
 * @returns The limit, or none.
 */
const writtenLimitOf = (path: string): Limit | undefined => {
  if (strayPercent.test(path)) {
    return "percent";
  }

  if (path.includes("\\")) {
    return "backslash";
  }

  if (regex("[\t\n\r]", "u").test(path)) {
    return "control";
  }

  return regex("^[^/]*:", "u").test(path) ? "colon" : undefined;
};

/**
 * What an href's path comes to against a base before any segment is decoded.
 */
type Step =
  | { readonly _tag: "document" }
  | { readonly _tag: "external" }
  | { readonly _tag: "unresolved"; readonly limit: Limit }
  | { readonly _tag: "segments"; readonly segments: readonly string[] };

/**
 * Read the path piece of an href (reading 102): up to its first `?` or `#`, where its query or
 * fragment starts (RFC 3986, §3.3).
 *
 * @param value - The href's value.
 * @returns Its path.
 */
export const hrefPathOf = (value: string): string => {
  const at = value.search(regex("[?#]", "u"));

  return at === -1 ? value : value.slice(0, at);
};

/**
 * Resolve an href's path against a base, as far as its written segments (RFC 3986, §5.2.2 to
 * §5.2.4): a scheme, or a path that starts with `/`, is external (readings 35 and 102); an empty
 * path names its own document (§4.4); a relative path against an external base is external, and
 * against an unresolved one unresolved; a path that meets a {@link Limit} as written is
 * unresolved; and any other is resolved within the package by RFC 3986's own resolution
 * (grizzle-text's `resolveWithin`): merged with the base's directory and its dot segments removed,
 * each `..` dropping the segment before it and one that climbs above the package root resolving
 * outside the package.
 *
 * @param value - The href's value, read by its whitespace class.
 * @param base - The base in scope.
 * @returns The step.
 */
const stepOf = (value: string, base: HrefBase): Step => {
  const path = hrefPathOf(value);
  if (schemeStart.test(value) || path.startsWith("/")) {
    return { _tag: "external" };
  }

  if (path === "") {
    return { _tag: "document" };
  }

  if (base._tag !== "package") {
    return base;
  }

  const limit = writtenLimitOf(path);
  if (limit !== undefined) {
    return { _tag: "unresolved", limit };
  }

  const resolved = resolveWithin(
    `${packageUri}${base.segments.map(dotsDecodedOf).join("/")}`,
    path.split("/").map(dotsDecodedOf).join("/"),
  );

  return resolved._tag === "Within"
    ? { _tag: "segments", segments: resolved.target.slice(packageUri.length).split("/") }
    : { _tag: "external" };
};

/**
 * The strict UTF-8 decoder a resolved segment's octets are read by: it refuses an invalid
 * sequence rather than replace it, and keeps a leading U+FEFF as a character of the name, where
 * the default decoder would drop it as a byte order mark.
 */
const utf8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

/**
 * Encode text as UTF-8, each character's octets as XLink's escaping writes them.
 */
const encoder = new TextEncoder();

/**
 * Percent-decode one segment (RFC 3986, §2.1): each `%HH` its octet and every other character its
 * UTF-8 octets, read back as UTF-8.
 *
 * @param segment - The segment, written, every `%` the start of a percent-encoding.
 * @returns The name it spells, or the limit it meets: octets that are no UTF-8, or a name holding
 *   `/` or U+0000.
 */
const decodedSegmentOf = (segment: string): Result.Result<string, Limit> => {
  const octets: number[] = [];
  for (const [token] of segment.matchAll(regex("%[0-9A-Fa-f]{2}|.", "gsu"))) {
    const spelled = token.startsWith("%")
      ? [Number.parseInt(token.slice(1), 16)]
      : encoder.encode(token);
    for (const octet of spelled) {
      octets.push(octet);
    }
  }

  return Result.match(
    Result.try(() => utf8.decode(Uint8Array.from(octets))),
    {
      onFailure: (): Result.Result<string, Limit> => Result.fail("octets"),
      onSuccess: (name): Result.Result<string, Limit> =>
        name.includes("/") || name.includes("\u0000")
          ? Result.fail("separator")
          : Result.succeed(name),
    },
  );
};

/**
 * Resolve an href against its base (readings 102 and 103): {@link stepOf}, then each remaining
 * segment percent-decoded, so `my%20sign.png` and `my sign.png` both name the entry `my sign.png`.
 *
 * @param value - The text the href resolves from ({@link hrefTextOf}).
 * @param base - The base in scope.
 * @returns Its resolution.
 */
export const resolveIn = (value: string, base: HrefBase): HrefResolution => {
  const step = stepOf(value, base);
  if (step._tag === "document" || step._tag === "external") {
    return { scope: step._tag };
  }

  if (step._tag === "unresolved") {
    return { limit: step.limit, scope: "unresolved" };
  }

  const names: string[] = [];
  for (const segment of step.segments) {
    const decoded = decodedSegmentOf(segment);
    if (Result.isFailure(decoded)) {
      return { limit: decoded.failure, scope: "unresolved" };
    }

    names.push(decoded.success);
  }

  return { path: names.join("/"), scope: "entry" };
};

/**
 * Take the base an `xml:base` sets for its element's scope (xml.xsd; RFC 3986, §5.1.1): its value
 * resolved against the base in scope as an href's is, its segments left as written, since only a
 * reference's own resolution is decoded. An `xml:base` whose path is empty leaves the base as it
 * is.
 *
 * @param value - The text the `xml:base` resolves from ({@link hrefTextOf}).
 * @param base - The base in scope at its element's parent.
 * @returns The element's base.
 */
export const baseIn = (value: string, base: HrefBase): HrefBase => {
  const step = stepOf(value, base);
  if (step._tag === "document") {
    return base;
  }

  return step._tag === "segments" ? { _tag: "package", segments: step.segments } : step;
};

/**
 * Read the base of a node of a document.
 *
 * @param bases - The document's bases, as {@link basesOf} computes them.
 * @param node - The position of a node of the document.
 * @returns Its base.
 * @throws {Error} When the node has none: every node of a document has a base, each computed after
 *   its parent's, so a miss names a node of another document, or one read before its parent.
 */
const baseAt = (bases: ReadonlyMap<bigint, HrefBase>, node: bigint): HrefBase => {
  const base = bases.get(node);
  if (base === undefined) {
    throw new Error(
      `The node at ${String(node)} has no base: every node of a document has one, each computed after its parent's. Resolve each href against its own document's rows, in document order.`,
    );
  }

  return base;
};

/**
 * Compute the base of every node of a document: the document's own path at its root, and below it
 * each element's parent's, resolved with the element's own `xml:base` where it holds one (XML
 * Base: an element's other attributes resolve against its own `xml:base`).
 *
 * @param document - The document flattened: its rows, in document order, so each parent precedes
 *   its children, and its attributes' index.
 * @param path - The document's path in its package.
 * @returns Each node's base, by its position.
 */
export const basesOf = (document: FlatDocument, path: string): ReadonlyMap<bigint, HrefBase> => {
  const root = documentBase(path);
  const bases = new Map<bigint, HrefBase>();
  for (const node of document.rows.nodes) {
    const inherited = node.start === 0n ? root : baseAt(bases, node.parent);
    bases.set(
      node.start,
      Option.match(valueAt(document, node, "xml:base"), {
        onNone: () => inherited,
        onSome: (own) => baseIn(hrefTextOf(own), inherited),
      }),
    );
  }

  return bases;
};

/**
 * Resolve a value of a node of a document as an href: an attribute's value ({@link valueAt}), or a
 * text's read in its class.
 */
type HrefResolver = (node: bigint, value: string) => HrefResolution;

/**
 * Build the resolver of a document's hrefs: each against its element's base ({@link basesOf}).
 * Every builder that reads what an href names reads it here, so a reference's `ReferencePath`, an
 * item ref's target and a site's path are one resolution.
 *
 * @param document - The document flattened.
 * @param path - The document's path in its package.
 * @returns The resolver.
 */
export const hrefResolverOf = (document: FlatDocument, path: string): HrefResolver => {
  const bases = basesOf(document, path);

  return (node, value) => resolveIn(hrefTextOf(value), baseAt(bases, node));
};

/**
 * The entry path a resolution names, none for one outside the package.
 *
 * @param resolution - The resolution.
 * @returns Its path where its scope is `entry`, and none for every other scope.
 */
export const entryPathOf = (resolution: HrefResolution): Option.Option<string> =>
  resolution.scope === "entry" ? Option.some(resolution.path) : Option.none();

/**
 * The path an href is compared by, an item ref's or a site's (`#pantry/import/overlays/tests.ts`
 * `ResolvedHref`), and a resource's (`resourcePathsOf`): the entry path it resolves to in the
 * package, and otherwise its path piece as read, so two external hrefs are compared as written
 * (reading 102), as `ResourceHrefOutside`'s and `FileOutside`'s `target` are.
 *
 * @param resolution - Its resolution.
 * @param value - Its value ({@link valueAt}).
 * @returns The path.
 */
export const comparedPathOf = (resolution: HrefResolution, value: string): string =>
  resolution.scope === "entry" ? resolution.path : hrefPathOf(hrefTextOf(value));

/**
 * Build the overlay rows of a package's manifest.
 *
 * An href's row stands exactly where the href is written (a `cp:file`'s `href`, a `cp:resource`'s
 * optional one), and holds its resolution, never its form; AL3 refuses an absent required
 * attribute. The manifest's and the resources' identifiers, a resource's type code and the
 * resource a dependency names are the database's queries over `Attribute`, never rows
 * (`#pantry/qti/overlay-queries/package.ts`, `#pantry/qti/queries.ts`); the host reads a
 * resource's type for itself ({@link resourceTypesOf}).
 *
 * A resource's `href` and a file's are resolved against the manifest's path, the package root,
 * through every `xml:base` of a `cp:manifest`, `cp:resources` or `cp:resource` in scope (IMS
 * Content Packaging 1.2, §6.11.1, the Base class: "Relative references appearing within the scope
 * of a Base object shall then be interpreted according to the rules defined in RFC3986").
 *
 * @param view - The manifest's view, judged in its own context: no site names the manifest, which
 *   is no resource's document (spec reading 146).
 * @param ids - Its package.
 * @returns Every overlay's rows.
 */
export const rowsOf = (view: DocumentView, ids: ManifestIds): PackageRows => {
  const { rows } = view;
  const resolve = hrefResolverOf(view, manifestPath);
  const at = { package: ids.package, path: manifestPath };
  const keyAt = (node: NodeRow<Composed>): string =>
    keyTextOf(ids.package, manifestPath, node.start);
  const files = new Map<string, Addition<typeof File>>();
  const filePaths = new Map<string, Addition<typeof FilePath>>();
  const filesOutside = new Map<string, Addition<typeof FileOutside>>();
  const resourceHrefs = new Map<string, Addition<typeof ResourceHref>>();
  const resourcePaths = new Map<string, Addition<typeof ResourceHrefPath>>();
  const resourcesOutside = new Map<string, Addition<typeof ResourceHrefOutside>>();

  for (const node of rows.nodes) {
    const key = keyAt(node);
    const head = { ...at, start: node.start };

    if (node.kind === "cp:resource") {
      for (const href of Option.toArray(valueAt(view, node, "href"))) {
        const resolution = resolve(node.start, href);
        resourceHrefs.set(key, { ...head, scope: resolution.scope });
        if (resolution.scope === "entry") {
          resourcePaths.set(key, { ...head, target: resolution.path });
        }

        if (resolution.scope === "external") {
          resourcesOutside.set(key, { ...head, target: hrefPathOf(hrefTextOf(href)) });
        }
      }
    }

    for (const href of node.kind === "cp:file" ? Option.toArray(valueAt(view, node, "href")) : []) {
      const resolution = resolve(node.start, href);
      files.set(key, { ...head, scope: resolution.scope });
      if (resolution.scope === "entry") {
        filePaths.set(key, { ...head, target: resolution.path });
      }

      if (resolution.scope === "external") {
        filesOutside.set(key, { ...head, target: hrefPathOf(hrefTextOf(href)) });
      }
    }
  }

  return {
    File: files,
    FileOutside: filesOutside,
    FilePath: filePaths,
    ResourceHref: resourceHrefs,
    ResourceHrefOutside: resourcesOutside,
    ResourceHrefPath: resourcePaths,
  };
};

/**
 * Read each resource's type code from a manifest's rows: the `ResourceType` handle its `type`'s
 * value spells (C17; {@link valueAt}, the form as written, since
 * the attribute's type is an `xs:string` enumeration), the host's reading of the join the database
 * reads, `resourceTypes` of `#pantry/qti/queries.ts`, which no row stores.
 *
 * @param manifest - The manifest flattened, read through its attributes' index.
 * @returns Each `cp:resource`'s code, by its position: none for a resource that writes no `type`,
 *   or whose `type` spells no handle, which AL3 or the attribute's value domain refuses alone (spec
 *   reading 67).
 */
export const resourceTypesOf = (manifest: FlatDocument): ReadonlyMap<bigint, ResourceTypeHandle> =>
  new Map(
    manifest.rows.nodes.flatMap((node) =>
      node.kind === "cp:resource"
        ? Option.toArray(Option.flatMap(valueAt(manifest, node, "type"), typeOf)).map(
            (code) => [node.start, code] as const,
          )
        : [],
    ),
  );

/**
 * A typed href that resolves in the package as the host reads it: a resource's `ResourceHrefPath`
 * beside its type's code. Its `path` is the manifest's, the document that lists the resource, and
 * `target` the entry path its href names.
 */
export type TypedPathRow = Pick<
  Addition<typeof ResourceHrefPath>,
  "package" | "path" | "start" | "target"
> & { readonly type: ResourceTypeHandle };

/**
 * Read the typed hrefs of a manifest that resolve in the package: each resource's entry path
 * beside the code its `type` spells, the rows of the query `TypedPath` (`#pantry/qti/queries.ts`),
 * which no table stores. The importer reads them on the host before it writes a row, to name the
 * documents it reads ({@link namedDocuments}) and the resources an item ref names; the database
 * reads the same join where a rule over the query judges the rows written. An href outside the
 * package names no entry, so it names no document and is no item ref's target.
 *
 * @param rows - The manifest's overlay rows.
 * @param types - Its resources' type codes ({@link resourceTypesOf}).
 * @returns The typed paths, in the manifest's order: none for a resource whose href resolves
 *   outside the package or not at all, or whose `type` spells no handle.
 */
export const typedPathsOf = (
  rows: Pick<PackageRows, "ResourceHrefPath">,
  types: ReadonlyMap<bigint, ResourceTypeHandle>,
): readonly TypedPathRow[] =>
  [...rows.ResourceHrefPath.values()].flatMap(({ package: pkg, path, start, target }) =>
    Option.toArray(Option.fromUndefinedOr(types.get(start))).map((type) => ({
      package: pkg,
      path,
      start,
      target,
      type,
    })),
  );

/**
 * Name the documents a manifest's resources name (reading 93): each pair of the entry path an href
 * resolves to in the package and a resource type `RootOfType` maps, so the importer reads the entry
 * at the path as a document of that type (reading 102: the href's launch parameters name no other
 * file). An href outside the package names no document, and "Document entry" refuses it.
 *
 * @param typed - The manifest's typed paths ({@link typedPathsOf}).
 * @returns The named documents' paths and types, a keyed set by (path, type), in the manifest's
 *   order. One path named under two types is two pairs; the import reads the path once, as the
 *   type its root bears out (`#pantry/import/program.ts`, reading 162), so the other's href names
 *   no document of its type, and "Document entry" refuses it.
 */
export const namedDocuments = (
  typed: readonly TypedPathRow[],
): ReadonlyMap<string, { readonly path: string; readonly type: ResourceTypeHandle }> =>
  new Map(
    typed.flatMap(({ target, type }) =>
      documentTyped.has(type) ? [[keyTextOf(target, type), { path: target, type }] as const] : [],
    ),
  );

/**
 * Read the path each resource's `href` is compared by, as its `ResourceHref` row holds it: for the
 * builders of other overlays that read the document a resource names (its LOM record's object,
 * reading 62).
 *
 * @param manifest - The manifest flattened.
 * @returns Each `cp:resource`'s path, by its position, for every resource that writes an `href`.
 */
export const resourcePathsOf = (manifest: FlatDocument): ReadonlyMap<bigint, string> => {
  const resolve = hrefResolverOf(manifest, manifestPath);

  return new Map(
    manifest.rows.nodes.flatMap((node) =>
      node.kind === "cp:resource"
        ? Option.toArray(valueAt(manifest, node, "href")).map(
            (href) => [node.start, comparedPathOf(resolve(node.start, href), href)] as const,
          )
        : [],
    ),
  );
};

/**
 * The reference census: how an attribute of a name on an element of a kind names its files, its
 * form, none for an attribute that names no file.
 */
export type ReferenceCensus = (kind: string, name: string) => Option.Option<ReferenceForm>;

/**
 * The base a `package` or `module` value resolves against: the content package's root, the
 * manifest's directory, whatever its document's path or the `xml:base` in scope (spec reading
 * 201: "Relative URLs indicate relative paths in the QTI content package", information
 * model §5.77.1; "Otherwise it should be assumed to be a QTI content package relative path", the
 * implementation guide §3.7.12.2).
 */
const packageRoot: HrefBase = documentBase(manifestPath);

/**
 * The extension an AMD loader gives a module location: "The URL should not include the file
 * extension, '.js' will be assumed" (the implementation guide, appendix D).
 */
const moduleExtension = ".js";

/**
 * Name the file a `module` value loads (spec reading 201): the entry its path resolves to,
 * with `.js` appended unless its name already ends in `.js`, which the guide's "should not" leaves
 * an author free to write (the corpus's `modules/lib/eve.js`). Any other resolution is the value's
 * as resolved.
 *
 * @param resolution - The value resolved against the package's root.
 * @returns The file it names.
 */
const moduleFileOf = (resolution: HrefResolution): HrefResolution =>
  resolution.scope === "entry" && !resolution.path.endsWith(moduleExtension)
    ? { path: `${resolution.path}${moduleExtension}`, scope: "entry" }
    : resolution;

/**
 * Resolve a `package` or `module` value against the package's root (spec reading 201), a
 * `module` value to the file it loads ({@link moduleFileOf}).
 *
 * @param form - The value's form.
 * @param value - The value, read by its whitespace class.
 * @returns Its resolution.
 */
export const resolveFromRoot = (form: "module" | "package", value: string): HrefResolution => {
  const resolution = resolveIn(value, packageRoot);

  return form === "module" ? moduleFileOf(resolution) : resolution;
};

/**
 * Read the class a census attribute's value is normalized in, the one `Attribute.value` reads
 * (`valueReadingOf` of `#pantry/import/names.ts`).
 *
 * @param element - Its element's node row.
 * @param name - The attribute's name.
 * @param lexical - Its lexical form.
 * @returns The class.
 * @throws {Error} When the element's governor admits no attribute of the name: the census lists
 *   only attributes its kinds declare, each under every governor of its kind, so a miss is a broken
 *   census or grammar table, never a form to read.
 */
const censusClassOf = (
  element: NodeRow<Composed>,
  name: string,
  lexical: string,
): WhiteSpaceClass => {
  const governor = governorOf(element.kind, element.governs);
  const reading = valueReadingOf(governor, name, lexical);
  if (reading._tag === "unadmitted") {
    throw new Error(
      `ReferenceAttribute lists ${element.kind}@${name}, which its governor ${governor} admits not. The census lists only declared attributes: regenerate the grammar's reference census from the declarations.`,
    );
  }

  return reading.whiteSpace;
};

/**
 * The grammar's reference census, `ReferenceAttribute` (spec reading 103): the census the
 * database's copy into `Reference` selects by, so the builder writes a row for exactly the
 * attributes the copy requires one of. Its `form` is how a value names its files: one URI
 * reference (`uri`), a list of image candidates (`srcset`), one URI reference against the
 * package's root (`package`), or an AMD module location (`module`).
 *
 * @param kind - The element's kind.
 * @param name - The attribute's name.
 * @returns Its form, none for an attribute the census does not list.
 */
export const referenceCensus: ReferenceCensus = (kind, name) =>
  Option.map(grammar.references.referenceAttribute.lookup({ kind, name }), ({ form }) => form);

/**
 * One image candidate of a `srcset` as its `Srcset`'s family nests it: without the element's
 * `package`, `path` and `start` the nesting supplies, nor the `at` the family draws.
 */
type SrcsetCandidateInsert = Omit<Addition<typeof SrcsetCandidate>, "package" | "path" | "start">;

/**
 * A `srcset`'s row, with its image candidates nested at its count field.
 */
type SrcsetRow = Addition<typeof Srcset> & {
  readonly tokens: readonly SrcsetCandidateInsert[];
};

/**
 * A document's reference rows, one keyed set per relation, keyed as {@link PackageRows} are: each
 * reference and each resolved reference by the JSON array of its key's values; each `srcset` with
 * its image candidates nested, and each candidate resolved in the package by its element's place
 * and its index.
 */
export interface ReferenceRows {
  readonly CandidatePath: ReadonlyMap<string, Addition<typeof CandidatePath>>;
  readonly Reference: ReadonlyMap<string, Addition<typeof Reference>>;
  readonly ReferencePath: ReadonlyMap<string, Addition<typeof ReferencePath>>;
  readonly Srcset: ReadonlyMap<string, SrcsetRow>;
  readonly TextReference: ReadonlyMap<string, Addition<typeof TextReference>>;
  readonly TextReferencePath: ReadonlyMap<string, Addition<typeof TextReferencePath>>;
}

/**
 * The whitespace class each kind of the text census reads its text under, by kind.
 */
const textWhiteSpaces: ReadonlyMap<string, WhiteSpaceClass> = new Map(
  textReferenceKinds.map(({ kind, whiteSpace }) => [kind, whiteSpace] as const),
);

/**
 * Build a document's reference rows (`#pantry/qti/package.ts`): each attribute of the census with
 * its written split and its `HrefScope`, and each that resolves in the package with the
 * entry path it names, its `ReferencePath`; and each element of the text census
 * (`textReferenceKinds`, spec reading R9-b) with its string value split and resolved the same way,
 * its `TextReference` and `TextReferencePath`.
 *
 * Every value of the form `uri` resolves as one href ({@link resolveIn}), read in the class its
 * `value` is normalized in ({@link censusClassOf}, the class of the host's `attributeValueOf` of
 * `#pantry/import/names.ts`), and one of the form `package` or `module` the
 * same way against the package's root, a
 * `module` value to its path with `.js` appended ({@link resolveFromRoot}). A `srcset` is its image
 * candidates (HTML, "parse a srcset attribute",
 * `srcsetCandidatesOf`), each candidate's URL resolved as an href is, its `SrcsetCandidate` nested
 * under its `Srcset` and, where it resolves in the package, its `CandidatePath` (spec reading 102).
 *
 * @param view - The document's view: its rows under the ids they are written under.
 * @param ids - Its package and its path.
 * @param census - The reference census.
 * @returns Its reference rows.
 */
export const referenceRowsOf = (
  view: DocumentView,
  ids: Place,
  census: ReferenceCensus,
): ReferenceRows => {
  const { rows } = view;
  const at = { package: ids.package, path: ids.path };
  const resolve = hrefResolverOf(view, ids.path);
  const nodes = new Map(rows.nodes.map((node) => [node.start, node] as const));
  const references = new Map<string, Addition<typeof Reference>>();
  const paths = new Map<string, Addition<typeof ReferencePath>>();
  const textReferences = new Map<string, Addition<typeof TextReference>>();
  const textPaths = new Map<string, Addition<typeof TextReferencePath>>();
  const srcsets = new Map<string, SrcsetRow>();
  const candidatePaths = new Map<string, Addition<typeof CandidatePath>>();
  const values = stringValuesOf(rows);

  for (const element of rows.nodes) {
    const whiteSpace = textWhiteSpaces.get(element.kind);
    if (whiteSpace === undefined) {
      continue;
    }

    const lexical = values.get(element.start) ?? "";
    const resolution = resolve(element.start, normalizedIn(lexical, whiteSpace));
    const key = keyTextOf(ids.package, ids.path, element.start);
    textReferences.set(key, {
      ...at,
      kind: element.kind,
      scope: resolution.scope,
      start: element.start,
      ...referencePiecesOf(lexical),
    });
    if (resolution.scope === "entry") {
      textPaths.set(key, {
        ...at,
        kind: element.kind,
        start: element.start,
        target: resolution.path,
      });
    }
  }

  for (const { lexical, name: attribute, start } of rows.attributes) {
    const element = nodes.get(start);
    if (element === undefined) {
      throw new Error(
        `flatten wrote an attribute ${attribute} of the node at ${String(start)}, and wrote no node there. Correct flatten.`,
      );
    }

    const listed = census(element.kind, attribute);
    if (Option.isNone(listed)) {
      continue;
    }

    const form = listed.value;
    if (form === "srcset") {
      const { candidates, trail } = srcsetCandidatesOf(lexical);
      srcsets.set(keyTextOf(ids.package, ids.path, start), {
        ...at,
        start,
        tokens: candidates.map(({ descriptor, lead, url }, index) => {
          const candidate = resolve(start, url);
          if (candidate.scope === "entry") {
            candidatePaths.set(keyTextOf(ids.package, ids.path, start, String(index)), {
              ...at,
              at: BigInt(index),
              start,
              target: candidate.path,
            });
          }

          return { descriptor, lead, scope: candidate.scope, url };
        }),
        trail,
      });
      continue;
    }

    const value = normalizedIn(lexical, censusClassOf(element, attribute, lexical));
    const resolution =
      form === "module" || form === "package"
        ? resolveFromRoot(form, hrefTextOf(value))
        : resolve(start, value);
    const key = keyTextOf(ids.package, ids.path, start, attribute);
    references.set(key, {
      ...at,
      kind: element.kind,
      name: attribute,
      scope: resolution.scope,
      start,
      ...referencePiecesOf(lexical),
    });
    if (resolution.scope === "entry") {
      paths.set(key, {
        ...at,
        kind: element.kind,
        name: attribute,
        start,
        target: resolution.path,
      });
    }
  }

  return {
    CandidatePath: candidatePaths,
    Reference: references,
    ReferencePath: paths,
    Srcset: srcsets,
    TextReference: textReferences,
    TextReferencePath: textPaths,
  };
};
