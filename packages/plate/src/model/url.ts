/**
 * URL classification: which URL attributes an item body carries, and whether each value stays,
 * and in what parsed form, or is dropped as an unsupported feature.
 *
 * The WHATWG URL parser decides every case, never a pattern over the raw text, because the browser
 * strips spaces, tabs, newlines and control characters before it reads a scheme: `java\tscript:`
 * is a `javascript:` URL. A kept value is written back in its parsed form, never as written, so
 * the browser reads exactly what was checked. `checkAdmitted` applies {@link classifyUrl} to every
 * attribute {@link urlAttributes} lists ({@link classifyUrlAt}), and the server shell writes kept
 * values with {@link addressUrl}, each package path as the address the configuration's `assets`
 * gives its file; neither lists URL attributes of its own. Each value is first read as its type's
 * whiteSpace facet reads it ({@link urlValueOf}), so the parser reads QTI's value, never the
 * lexical form.
 *
 * A package path is resolved against the item's own location, the path from the package root the
 * host named the item by, as RFC 3986 section 5.2 resolves a relative reference: `media/a.png` in
 * `items/q1.xml` names the file `items/media/a.png`, and `../images/a.png` names `images/a.png`
 * ({@link assetReferenceOf}). A PCI's module location is the one exception: it is a path from the
 * package root, whatever the item's directory ({@link baseLocationOf}). A path that climbs above
 * the package root names no file of the package (reading 102), so `checkAdmitted` drops it. Its
 * address comes from `assets` alone, never from the page's base: a file with no address has no URL
 * plate writes, so `<Item>` refuses the item rather than write the path relative to the page.
 *
 * @module
 * @see https://url.spec.whatwg.org/#concept-basic-url-parser
 */
import { Option, Result } from "effect";
import type { Brand } from "effect";
import { elementAttributes } from "#plate/content/mathml-attributes.ts";
import { resolveIn, withoutQuery } from "#plate/document/href.ts";
import { mathmlNamespace, qtiNamespace } from "#plate/document/source.ts";
import { collapseXmlSpace, replaceXmlSpace } from "#plate/model/attributes.ts";
import type { SourceAttribute, SourceElement } from "#plate/document/source.ts";

/**
 * How a URL attribute is used, which decides what it admits.
 *
 * - `link`: navigated to or cited (`a@href`, `img@longdesc`, `cite`). Package paths, `http`, `https`
 *   and same-document fragments.
 * - `resource`: fetched as passive media (`src`, `poster`). Package paths, `http` and `https`.
 * - `embed`: a nested document (`object@data`, and a stimulus ref's `href`). Package paths only.
 * - `srcset`: a list of image candidates, each a `resource`.
 * - `package`: a location the host loads as a script or a configuration, which the page never fetches
 *   itself (a PCI's module locations). A package path, resolved against the package root rather
 *   than the item's directory ({@link baseLocationOf}) and addressed through the configuration's
 *   `assets` as a `resource` is, or an `https` URL; `http` and every other scheme is dropped with
 *   {@link schemeFeature}, since the page serving a module over `https` cannot load it over
 *   `http`.
 */
export type UrlContext = "embed" | "link" | "package" | "resource" | "srcset";

/**
 * A name in a namespace, an element's or an attribute's, as the source tree holds it: the
 * coordinate a URL attribute is looked up by, so an element of another namespace that shares a
 * body element's local name (an SVG `a`) is never read as that element.
 */
type ExpandedName = Pick<SourceAttribute | SourceElement, "local" | "namespace">;

/**
 * How an attribute's lexical form is read into its value: the `whiteSpace` facet of its type (XML
 * Schema 1.0 Part 2, §4.3.6): `collapse` for an `xs:anyURI` ("whiteSpace = collapse", §3.2.17),
 * `replace` for an `xs:normalizedString` and `URLDType`, the ASI XSD's restriction of it, and
 * `preserve` for an `xs:string`.
 */
type WhiteSpace = "collapse" | "preserve" | "replace";

/**
 * One URL-bearing attribute of an element plate renders: the element's expanded name, the
 * attribute's local name, every one of them in no namespace, how it is used, and the whiteSpace
 * facet of its type, which its value is read under before it is classified.
 */
interface UrlAttribute {
  readonly attribute: string;
  readonly context: UrlContext;
  readonly element: ExpandedName;
  readonly whiteSpace: WhiteSpace;
}

/**
 * Name a URL attribute of an item body element, which is in QTI's namespace.
 *
 * @param local The element's local name.
 * @param attribute The attribute's local name.
 * @param context How it is used.
 * @param whiteSpace The whiteSpace facet of the type the ASI XSD gives it.
 * @returns The row.
 */
const body = (
  local: string,
  attribute: string,
  context: UrlContext,
  whiteSpace: WhiteSpace,
): UrlAttribute => ({
  attribute,
  context,
  element: { local, namespace: qtiNamespace },
  whiteSpace,
});

/**
 * Name a URL attribute of a MathML element, which MathML 3's schema types `xs:anyURI`
 * (`mathml3-common.xsd`'s `href` and `src`, `mathml3-presentation.xsd`'s `altimg` and `mglyph`'s
 * `src`), so it collapses.
 *
 * @param local The element's local name.
 * @param attribute The attribute's local name.
 * @param context How it is used.
 * @returns The row.
 */
const math = (local: string, attribute: string, context: UrlContext): UrlAttribute => ({
  attribute,
  context,
  element: { local, namespace: mathmlNamespace },
  whiteSpace: "collapse",
});

/**
 * Every URL attribute a browser fetches or follows on an element plate renders, keyed by the
 * element's expanded name.
 *
 * - **The item body's:** the XSD's `xs:anyURI` and `URLDType` attributes on body elements, and
 *   `object@data`, which the XSD types as `xs:string`. `param@value` is not here: `param` feeds
 *   plugins, and no browser plate supports runs any. The four `package` rows are a PCI's module
 *   locations, inside the interaction's own `qti-interaction-modules`: the configuration files,
 *   `primary-configuration` and `secondary-configuration`, and each module's `primary-path` and
 *   `fallback-path`, which the AMD loader extends with `.js`, each a path from the package root
 *   ({@link baseLocationOf}). The server shell writes no element of theirs, so it meets none of
 *   them; `checkAdmitted` classifies them, so the host that serves a module reads a location
 *   already kept or dropped.
 * - **The item root's:** `qti-assessment-stimulus-ref@href`, "The uri used to refer to the stimulus
 *   file (e.g. elsewhere in the same content package)" (information model §7.6.2), an `embed`: a
 *   nested document the host reads from the package and the server shell writes inside the item
 *   (`#plate/content/stimulus-ref.ts`), so it is a package path or nothing plate delivers. The
 *   shell writes no element of its own either, and `checkAdmitted` classifies it as it does a
 *   module's location.
 * - **MathML 3's:** `href` on every element (§2.1.6, "Attributes Shared by all MathML Elements"), a
 *   link; `math`'s `altimg` (§2.2.1) and `mglyph`'s and `annotation`'s `src` (§3.2.1.2, §5.2.2),
 *   each a resource; and `share`'s `src`, which names an element of the formula by its `#id`
 *   (§4.2.7), a link. `definitionURL` and `cdbase` name a definition, which no browser fetches.
 *
 * `checkAdmitted` and the server shell read this table; nothing else lists URL attributes. An
 * XInclude `href` is not here: a document that holds an `include` is left unchecked, so nothing
 * renders it.
 *
 * @see ~/.cache/qti-pie/qti3/xsd/imsqti_asiv3p0p1_v1p0.xsd (sha256 `bd82f6df…`), lines 24235 to 33756
 * @see https://www.w3.org/TR/MathML3/chapter2.html#fund.globatt
 */
const urlAttributes: readonly UrlAttribute[] = [
  body("a", "href", "link", "collapse"),
  body("audio", "src", "resource", "replace"),
  body("blockquote", "cite", "link", "collapse"),
  body("img", "longdesc", "link", "collapse"),
  body("img", "src", "resource", "collapse"),
  body("object", "data", "embed", "preserve"),
  body("q", "cite", "link", "collapse"),
  body("qti-assessment-stimulus-ref", "href", "embed", "collapse"),
  body("qti-interaction-module", "fallback-path", "package", "collapse"),
  body("qti-interaction-module", "primary-path", "package", "collapse"),
  body("qti-interaction-modules", "primary-configuration", "package", "collapse"),
  body("qti-interaction-modules", "secondary-configuration", "package", "collapse"),
  body("source", "src", "resource", "replace"),
  body("source", "srcset", "srcset", "replace"),
  body("track", "src", "resource", "replace"),
  body("video", "poster", "resource", "replace"),
  body("video", "src", "resource", "replace"),
  ...Array.from(elementAttributes, ([local, names]) =>
    names.has("href") ? [math(local, "href", "link")] : [],
  ).flat(),
  math("annotation", "src", "resource"),
  math("math", "altimg", "resource"),
  math("mglyph", "src", "resource"),
  math("share", "src", "link"),
];

/**
 * The key a URL attribute is indexed and looked up by: its element's expanded name and its own,
 * joined by U+0000, which XML admits in no name and no namespace name, so no two pairs share a key.
 *
 * @param element The element's expanded name.
 * @param attribute The attribute's expanded name.
 * @returns The key.
 */
const keyOf = (element: ExpandedName, attribute: ExpandedName): string =>
  [element.namespace, element.local, attribute.namespace, attribute.local].join("\u0000");

/**
 * {@link urlAttributes} by {@link keyOf}, each attribute in no namespace.
 */
const attributeIndex: ReadonlyMap<string, UrlAttribute> = new Map(
  urlAttributes.map((row) => [keyOf(row.element, { local: row.attribute, namespace: "" }), row]),
);

/**
 * Look up the context of a URL attribute.
 *
 * @param element The element's expanded name.
 * @param attribute The attribute's expanded name.
 * @returns The attribute's context, or none when it is not a URL attribute of that element.
 */
export const urlContextOf = (
  element: ExpandedName,
  attribute: ExpandedName,
): Option.Option<UrlContext> =>
  Option.map(
    Option.fromUndefinedOr(attributeIndex.get(keyOf(element, attribute))),
    (row) => row.context,
  );

/**
 * Read a URL attribute's lexical form into its value, as its type's whiteSpace facet reads it
 * ({@link WhiteSpace}): an `xs:anyURI` collapsed, its outer whitespace gone and each inner run one
 * space, a `URLDType` each tab, line feed and carriage return a space, an `xs:string` as written.
 * The URL parser reads the value, never the lexical form, so `href="a b.xml"` names the file `a
 * b.xml`, as the database's importer resolves it (pantry's spec reading 102), where the parser
 * alone would keep both spaces, and a tab written `&#9;` in a `URLDType` is the space it reads as,
 * where the parser alone would remove it. An attribute that is no URL attribute of its element is
 * read as written, as an `xs:string` is: the database refuses one that holds a tab, a line feed or
 * a carriage return inside it under its stated limit "Href form" (pantry's spec reading 102, a
 * control character names no file), so the parser never meets one there.
 *
 * @param element The element's expanded name.
 * @param attribute The attribute's expanded name.
 * @param lexical The attribute's lexical form, as the reader gave it.
 * @returns Its value.
 */
export const urlValueOf = (
  element: ExpandedName,
  attribute: ExpandedName,
  lexical: string,
): string => {
  const whiteSpace = attributeIndex.get(keyOf(element, attribute))?.whiteSpace ?? "preserve";

  switch (whiteSpace) {
    case "collapse": {
      return collapseXmlSpace(lexical);
    }
    case "replace": {
      return replaceXmlSpace(lexical);
    }
    case "preserve": {
      return lexical;
    }
    default: {
      return whiteSpace satisfies never;
    }
  }
};

/**
 * The feature key of a URL that resolves outside the package: a host-absolute path (`/x`), a path
 * that climbs above the package root (`../x` in an item at the root), a network path (`//host`,
 * `\\host`), or a remote URL where the context admits only package paths.
 */
const outsidePackageFeature = "url-outside-package";

/**
 * The feature key of a value the URL parser refuses, such as `http://[`, and of a blank value
 * (empty, or only spaces and control characters the parser strips), which would request the
 * item's directory. The XSD's `xs:anyURI` and `URLDType` admit both, so they are dropped, never
 * refused.
 */
const invalidUrlFeature = "url-invalid";

/**
 * The prefix of the feature key of a URL dropped for its scheme, as {@link schemeFeature} writes
 * it.
 */
const schemeFeaturePrefix = "url-scheme:";

/**
 * Construct the feature key of a URL dropped for its scheme.
 *
 * @param scheme The scheme as the URL parser reads it: lower case, without the colon.
 * @returns `url-scheme:<scheme>`, for example `url-scheme:javascript`.
 */
const schemeFeature = (scheme: string): string => `${schemeFeaturePrefix}${scheme}`;

/**
 * A kept URL relative to the item's directory.
 */
interface PackageUrl {
  readonly kind: "package";
  /**
   * The parsed path relative to the item's directory, with its query and fragment, percent-encoded
   * as the parser writes it: one `../` for each directory it climbs above the item's, then its path
   * below the directory it reaches (`images/a%20b.png`, `../images/a.png`). It is a relative
   * reference that resolves to the same place against any directory: when a path that climbs none
   * would read as a scheme, a host, an absolute path or a fragment (`javascript:x`, `//evil.com/x`,
   * `#q1`), it starts with `./`, and the item's directory itself is `./`, never the empty value
   * {@link classifyUrl} drops. The prefix is load-bearing: `checkAdmitted` writes the path as the
   * whole attribute value the item holds, and the server shell classifies that value again, so it
   * must read back as the same package path.
   */
  readonly path: string;
}

/**
 * A kept absolute `http` or `https` URL outside the package, as its parsed href.
 */
interface RemoteUrl {
  readonly href: string;
  readonly kind: "remote";
}

/**
 * A kept same-document reference (`#q1`) in the link context.
 */
interface FragmentUrl {
  /**
   * The parsed fragment without its `#`, percent-encoded as the parser writes it; empty for `#`.
   */
  readonly fragment: string;
  readonly kind: "fragment";
}

/**
 * One image candidate of a kept `srcset`: its URL and its width, density or height descriptors.
 */
interface SrcsetCandidate {
  readonly descriptors: readonly string[];
  readonly url: PackageUrl | RemoteUrl;
}

/**
 * A kept `srcset`: the candidates a browser reads from it, in order, at least one. A candidate
 * with invalid descriptors, which a browser skips, is classified but left out.
 */
interface SrcsetUrl {
  readonly candidates: readonly SrcsetCandidate[];
  readonly kind: "srcset";
}

/**
 * A URL attribute value that stays, in its parsed form.
 */
export type KeptUrl = FragmentUrl | PackageUrl | RemoteUrl | SrcsetUrl;

/**
 * A URL attribute value that is dropped: the attribute goes, the element and its content stay,
 * and the feature is recorded as unsupported with a notice.
 */
interface DroppedUrl {
  /**
   * {@link outsidePackageFeature}, {@link invalidUrlFeature} or a {@link schemeFeature} key.
   */
  readonly feature: string;
  readonly kind: "dropped";
}

/**
 * The classification of one URL attribute value.
 */
type ClassifiedUrl = DroppedUrl | KeptUrl;

/**
 * The origin of every base a value is resolved against: a host that cannot exist (RFC 2606).
 */
const packageOrigin = "https://package.invalid";

/**
 * A base on {@link packageOrigin} standing for the item's own directory, against which a value's
 * scheme is read and a path that climbs none is read back.
 */
const packageBase = `${packageOrigin}/root/`;

/**
 * The path of {@link packageBase}: the item's directory.
 */
const packageRoot = "/root/";

/**
 * A base with an opaque path. Against it the parser resolves only an absolute URL or a fragment
 * (`#q1`); every other relative reference fails, so it tells a fragment-only reference apart from
 * `./#q1`, which resolves to the same place against {@link packageBase}.
 *
 * @see https://url.spec.whatwg.org/#no-scheme-state
 */
const opaqueBase = "about:blank";

/**
 * Construct a dropped classification.
 *
 * @param feature The feature key it is dropped with.
 * @returns The classification.
 */
const dropped = (feature: string): DroppedUrl => ({ feature, kind: "dropped" });

/**
 * Write the part of a URL that locates it on its origin.
 *
 * @param url A parsed URL.
 * @returns Its path, query and fragment. An empty query or fragment (`x?`, `x#`) is written as
 *   none.
 */
const locationOf = (url: URL): string => `${url.pathname}${url.search}${url.hash}`;

/**
 * A relative path's place against the item's directory: how many directories it climbs above it,
 * and where it goes from the directory it reaches.
 */
interface RelativePath {
  /**
   * What follows the directory it reaches: the parsed path below it, then the query and fragment,
   * as the parser writes them.
   */
  readonly below: string;
  readonly climbs: number;
}

/**
 * Construct a directory on {@link packageOrigin}: `depth` directories, each named `name`.
 *
 * @param name The name of each directory.
 * @param depth How many there are.
 * @returns The directory's URL, ending in `/`.
 */
const sentinelDirectory = (name: string, depth: number): string =>
  `${packageOrigin}/${`${name}/`.repeat(depth)}`;

/**
 * Read a value as a relative path against the item's directory, as the URL parser resolves it.
 *
 * The parser removes dot segments, so against one base a climb cannot be told apart from a path
 * that names the directory it climbs out of: against `/d/`, `../d/x` and `x` both resolve to
 * `/d/x`. So the value is resolved against two directories of one depth whose every name differs
 * (`a/a/…/` and `b/b/…/`): what the value writes is the same in both results, and what remains of
 * the base differs at every segment, so the two results agree exactly from the segment where the
 * value's own path begins. Each segment of the value climbs at most one directory, so a depth one
 * more than its segments leaves the first directory in place: a result without it is no relative
 * path (`/x`, `//host/x`, `\\host\x`, or a path that spells `/a/x`).
 *
 * @param value An attribute value that is no absolute URL and that the parser resolves on an
 *   `https` base.
 * @returns The directories it climbs and what follows, or none when it is no relative path.
 * @see https://url.spec.whatwg.org/#path-state
 */
const relativePathOf = (value: string): Option.Option<RelativePath> => {
  // `\` separates segments as `/` does on an `https` base.
  const depth = (value.match(/[/\\]/gu)?.length ?? 0) + 2;
  const first = URL.parse(value, sentinelDirectory("a", depth));
  const second = URL.parse(value, sentinelDirectory("b", depth));
  if (
    first?.origin !== packageOrigin ||
    second?.origin !== packageOrigin ||
    !first.pathname.startsWith("/a/") ||
    !second.pathname.startsWith("/b/")
  ) {
    return Option.none();
  }

  const segments = first.pathname.split("/").slice(1);
  const others = second.pathname.split("/").slice(1);
  let start = segments.length;
  while (start > 0 && segments[start - 1] === others[start - 1]) {
    start -= 1;
  }

  return Option.some({
    below: `${segments.slice(start).join("/")}${first.search}${first.hash}`,
    climbs: depth - start,
  });
};

/**
 * Construct the package classification of a relative path, in the form that reads back as the
 * same path.
 *
 * @param relative The relative path.
 * @param relative.below What follows the directory it reaches.
 * @param relative.climbs The directories it climbs above the item's.
 * @returns One `../` for each directory it climbs, then what follows; a path that climbs none with
 *   `./` before it when the bare path would read otherwise or is empty.
 */
const packageUrl = ({ below, climbs }: RelativePath): PackageUrl => {
  if (climbs > 0) {
    return { kind: "package", path: `${"../".repeat(climbs)}${below}` };
  }

  const reread = URL.parse(below, packageBase);
  const plain =
    below !== "" &&
    !URL.canParse(below, opaqueBase) &&
    reread !== null &&
    reread.origin === packageOrigin &&
    locationOf(reread) === `${packageRoot}${below}`;

  return { kind: "package", path: plain ? below : `./${below}` };
};

/**
 * Report whether a value is empty once the URL parser strips it: nothing but spaces and C0
 * control characters, tab and newline among them. It would resolve to the item's directory.
 *
 * @param value The attribute value as written.
 * @returns Whether every character is a C0 control or a space.
 * @see https://url.spec.whatwg.org/#c0-control-or-space
 */
const isBlank = (value: string): boolean => {
  for (const character of value) {
    if (character > " ") {
      return false;
    }
  }

  return true;
};

/**
 * Classify one fetched URL: a package path, an absolute `http` or `https` URL where remote URLs
 * are admitted, or dropped.
 *
 * `https:evil.com/x` resolves against the `https` base as the package path `evil.com/x`, so it
 * is kept and written as that path, never as `https://evil.com/x`. A network path (`//host`) is
 * dropped even when it resolves to an `http` origin, because it inherits the page's scheme; only
 * a value that reads as the same URL with no base at all is remote. A blank value is dropped as
 * {@link invalidUrlFeature}: kept, it would request the item's directory, and an object would lose
 * its fallback content.
 *
 * @param value The attribute value as written.
 * @param remoteAdmitted Whether the context keeps remote URLs.
 * @returns The classification.
 */
const classifyFetched = (
  value: string,
  remoteAdmitted: boolean,
): DroppedUrl | PackageUrl | RemoteUrl => {
  const url = isBlank(value) ? null : URL.parse(value, packageBase);
  if (url === null) {
    return dropped(invalidUrlFeature);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return dropped(schemeFeature(url.protocol.slice(0, -1)));
  }

  if (URL.parse(value)?.href === url.href) {
    return remoteAdmitted ? { href: url.href, kind: "remote" } : dropped(outsidePackageFeature);
  }

  return Option.match(relativePathOf(value), {
    onNone: () => dropped(outsidePackageFeature),
    onSome: packageUrl,
  });
};

/**
 * Read a same-document reference: a value that is not an absolute URL and resolves against
 * {@link opaqueBase}, which only a fragment-only reference does.
 *
 * @param value The attribute value as written.
 * @returns The parsed fragment without its `#`, or none when the value is not fragment-only.
 */
const fragmentOf = (value: string): Option.Option<string> =>
  URL.canParse(value)
    ? Option.none()
    : Option.map(Option.fromNullOr(URL.parse(value, opaqueBase)), (url) => url.hash.slice(1));

/**
 * Report whether a character is ASCII whitespace, as the HTML `srcset` parser splits on it.
 *
 * @param character One character of the attribute value, or `""` past its end.
 * @returns Whether it is a tab, line feed, form feed, carriage return or space.
 */
const isAsciiWhitespace = (character: string): boolean =>
  character === " " ||
  character === "\t" ||
  character === "\n" ||
  character === "\f" ||
  character === "\r";

/**
 * One image candidate as the `srcset` parser splits it, before its URL is classified.
 */
export interface SplitCandidate {
  readonly descriptors: readonly string[];
  readonly url: string;
}

/**
 * A candidate's descriptors, and the position in the `srcset` value after them.
 */
interface Descriptors {
  readonly descriptors: readonly string[];
  readonly next: number;
}

/**
 * Collect a candidate's descriptors with the HTML descriptor tokenizer, from just after its URL.
 * A parenthesised descriptor runs to its `)`, commas and spaces included, or to the end of the
 * value.
 *
 * @param input The whole `srcset` value.
 * @param start The position after the candidate's URL.
 * @returns The descriptors, and the position the splitting loop resumes from.
 * @see https://html.spec.whatwg.org/multipage/images.html#parse-a-srcset-attribute
 */
const tokenizeDescriptors = (input: string, start: number): Descriptors => {
  const descriptors: string[] = [];
  let position = start;
  while (isAsciiWhitespace(input.charAt(position))) {
    position += 1;
  }

  let current = "";
  let inParens = false;
  while (position < input.length) {
    const character = input.charAt(position);
    if (inParens) {
      current += character;
      inParens = character !== ")";
    } else if (isAsciiWhitespace(character)) {
      if (current !== "") {
        descriptors.push(current);
        current = "";
      }
    } else if (character === ",") {
      return {
        descriptors: current === "" ? descriptors : [...descriptors, current],
        next: position + 1,
      };
    } else {
      current += character;
      inParens = character === "(";
    }

    position += 1;
  }

  return { descriptors: current === "" ? descriptors : [...descriptors, current], next: position };
};

/**
 * Split a `srcset` value into its image candidates with the HTML splitting loop: a URL is a run
 * of non-whitespace, trailing commas removed, and descriptors follow it up to the next top-level
 * comma.
 *
 * @param input The attribute value as written.
 * @returns The candidates, in order, with their descriptors unvalidated.
 * @see https://html.spec.whatwg.org/multipage/images.html#parse-a-srcset-attribute
 */
export const splitSrcset = (input: string): readonly SplitCandidate[] => {
  const candidates: SplitCandidate[] = [];
  let position = 0;
  for (;;) {
    while (isAsciiWhitespace(input.charAt(position)) || input.charAt(position) === ",") {
      position += 1;
    }

    if (position >= input.length) {
      return candidates;
    }

    const start = position;
    while (position < input.length && !isAsciiWhitespace(input.charAt(position))) {
      position += 1;
    }

    const token = input.slice(start, position);
    let end = token.length;
    while (token.charAt(end - 1) === ",") {
      end -= 1;
    }

    if (end < token.length) {
      candidates.push({ descriptors: [], url: token.slice(0, end) });
    } else {
      const { descriptors, next } = tokenizeDescriptors(input, position);
      candidates.push({ descriptors, url: token });
      position = next;
    }
  }
};

/**
 * A valid non-negative integer of HTML: one or more ASCII digits.
 *
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-non-negative-integer
 */
const nonNegativeInteger = /^[0-9]+$/u;

/**
 * A valid floating-point number of HTML: an optional `-`, digits with an optional fraction or a
 * fraction alone, and an optional exponent.
 *
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-floating-point-number
 */
const floatingPoint = /^-?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:[Ee][+-]?[0-9]+)?$/u;

/**
 * Report whether a candidate's descriptors pass the HTML descriptor parser: at most one width
 * (`480w`, above zero) or one density (`2x`, not negative), and a height (`200h`, above zero)
 * only beside a width. A browser skips a candidate that fails.
 *
 * @param descriptors The candidate's descriptors, as tokenized.
 * @returns Whether the browser keeps the candidate.
 * @see https://html.spec.whatwg.org/multipage/images.html#parse-a-srcset-attribute
 */
const validDescriptors = (descriptors: readonly string[]): boolean => {
  let width = false;
  let density = false;
  let height = false;
  for (const descriptor of descriptors) {
    const number = descriptor.slice(0, -1);
    const unit = descriptor.slice(-1);
    if (unit === "w" && nonNegativeInteger.test(number) && !width && !density) {
      width = Number(number) > 0;
      if (!width) {
        return false;
      }
    } else if (unit === "x" && floatingPoint.test(number) && !width && !density && !height) {
      density = Number(number) >= 0;
      if (!density) {
        return false;
      }
    } else if (unit === "h" && nonNegativeInteger.test(number) && !height && !density) {
      height = Number(number) > 0;
      if (!height) {
        return false;
      }
    } else {
      return false;
    }
  }

  return width || !height;
};

/**
 * A file's path from the package root, as the configuration's `assets` keys the file's address:
 * its segments joined by `/`, each the file's name as the package holds it (`items/media/a b.png`),
 * the first and the last not empty, none `.` or `..`. A segment between may be empty
 * (`media//a.png`), as RFC 3986 section 3.3 lets a path segment be (`segment = *pchar`): a package
 * may hold such an entry, and pantry stores it.
 *
 * It is the form an item's location takes, the path from the package root the host names the item
 * by when it opens it (`openAdmitted`'s `location`), and the form
 * {@link assetReferenceOf} resolves a package path to. The brand exists only in the type:
 * {@link isPackagePath} narrows a text to it, and the configuration's Schema brands each key of
 * `assets` through that check.
 */
export type PackagePath = Brand.Branded<string, "PackagePath">;

/**
 * Report whether a text is a {@link PackagePath}: not empty, neither starting with `/` (a path from
 * a host's root) nor ending with one (a directory, which names no file), and holding no `.` or
 * `..` segment. An empty segment between two others is a segment of its name, so `media//a.png`
 * names a file.
 *
 * @param text The text.
 * @returns Whether it names a file from the package root.
 * @see https://www.rfc-editor.org/rfc/rfc3986#section-3.3
 */
export const isPackagePath = (text: string): text is PackagePath => {
  const segments = text.split("/");

  return (
    segments[0] !== "" &&
    segments.at(-1) !== "" &&
    segments.every((segment) => segment !== "." && segment !== "..")
  );
};

/**
 * A package path resolved against the item's own location: the file it names, and what is written
 * after the file's address.
 */
interface AssetReference {
  /**
   * The URL's query and fragment in their parsed form, from its first `?` or `#`, empty when it
   * has neither. Only the path names a file, so they follow the file's address as written, and a
   * media fragment such as `#t=10` still selects within the file.
   */
  readonly params: string;
  /**
   * The file's path from the package root: the directory of the item's location, then the URL's
   * segments, each percent-decoded. It is a {@link PackagePath} whenever the location is one.
   */
  readonly path: string;
}

/**
 * A document at the package root, where the package's manifest is: a relative path resolved
 * against it names a file from the package root.
 */
const packageRootDocument = "imsmanifest.xml";

/**
 * Give the location a URL attribute's package paths resolve against: the item's own, and the
 * package root for a PCI's module location (`package`). QTI reads a module location and a
 * configuration file as paths in the content package, not in the item's directory (reading
 * 201). The implementation guide says of a module's location, "Otherwise it should be assumed to
 * be a QTI content package relative path", and reads the default configuration from "<content
 * package base href>/modules/module_resolution.js" (§3.7.12.2); a module's own `primary-path` and
 * `fallback-path` override a configuration's location with one of the same kind. The information
 * model says of `primary-configuration` and `secondary-configuration`, "Relative URLs indicate
 * relative paths in the QTI content package" (§5.77.1, §5.77.2). So an item at `items/q1.xml`
 * whose module is `modules/m` names `modules/m.js`, and `../modules/m` climbs above the package
 * root.
 *
 * @param location The item's location, its path from the package root.
 * @param context The attribute's context, from {@link urlContextOf}.
 * @returns The location its package paths resolve against.
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl#pci-amd-module-resolution-file-format
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_InteractionModules.Attr_primary-configuration
 */
const baseLocationOf = (location: string, context: UrlContext): string =>
  context === "package" ? packageRootDocument : location;

/**
 * Resolve a kept package URL against the item's location, as RFC 3986 section 5.2 merges a
 * relative path with its base's directory and removes its dot segments: the item's directory,
 * then the URL's segments, each percent-decoded to the name the package holds, as
 * `#plate/document/href.ts` names a package's documents (`resolveIn`, whose `decodeSegment` leaves
 * a segment with a malformed escape as written).
 *
 * `media/a%20b.png` in `items/q1.xml` names `items/media/a b.png`, `../images/a.png` names
 * `images/a.png`, and a leading `./` names the directory itself. A path whose `..` climbs above
 * the package root names no file of it, where RFC 3986 would drop the extra `..` (reading 102).
 * The location's own segments are taken as written.
 *
 * @param location The item's location, its path from the package root.
 * @param url The kept package path.
 * @returns The file it names and its query and fragment, or none when it climbs above the package
 *   root.
 * @see https://www.rfc-editor.org/rfc/rfc3986#section-5.2
 */
const assetReferenceOf = (location: string, url: PackageUrl): Option.Option<AssetReference> => {
  const at = url.path.search(/[?#]/u);

  return Option.map(resolveIn(location, url.path), (path) => ({
    params: at === -1 ? "" : url.path.slice(at),
    path,
  }));
};

/**
 * Write a kept URL in its parsed form, the value `checkAdmitted` writes into the item: a package
 * path as its path relative to the item's directory, a remote URL as its href, a fragment as
 * `#<fragment>`, and a `srcset` as its candidates.
 *
 * The server shell classifies that value again, which gives the same classification, and writes
 * it to the page with {@link addressUrl}.
 *
 * @param url The kept value.
 * @returns The attribute value. A `srcset` is its candidates, each URL written the same way and
 *   followed by its descriptors, joined by `, `.
 */
export const formatUrl = (url: KeptUrl): string => {
  switch (url.kind) {
    case "fragment": {
      return `#${url.fragment}`;
    }

    case "package": {
      return url.path;
    }

    case "remote": {
      return url.href;
    }

    case "srcset": {
      return url.candidates
        .map((candidate) => [formatUrl(candidate.url), ...candidate.descriptors].join(" "))
        .join(", ");
    }

    default: {
      return url satisfies never;
    }
  }
};

/**
 * Write a kept URL as the page's attribute value: a package path as the address `assets` gives the
 * file it names ({@link assetReferenceOf}), followed by its query and fragment; a remote URL as its
 * href; a fragment as `#<fragment>`, which the server shell rewrites to its scoped id itself; and a
 * `srcset` candidate by candidate, each followed by its descriptors, joined by `, `.
 *
 * No package path is ever written relative to the page: a file `assets` gives no address fails
 * the write. The configuration holds every address to a URL with no ASCII whitespace that neither
 * starts nor ends with a comma, so a `srcset` candidate written with one splits back as itself.
 *
 * @param url The kept value.
 * @param location The item's location, its path from the package root.
 * @param assets The address of each file, by its path from the package root.
 * @returns The attribute value, or the path of the first file a package path names that `assets`
 *   gives no address. A package path that climbs above the package root, which `checkAdmitted`
 *   drops, fails with the item's directory and then the path as written (`items/../../a.png`).
 */
export const addressUrl = (
  url: KeptUrl,
  location: string,
  assets: ReadonlyMap<PackagePath, string>,
): Result.Result<string, string> => {
  switch (url.kind) {
    case "fragment": {
      return Result.succeed(`#${url.fragment}`);
    }

    case "package": {
      return Option.match(assetReferenceOf(location, url), {
        onNone: () =>
          Result.fail([...location.split("/").slice(0, -1), withoutQuery(url.path)].join("/")),
        onSome: ({ params, path }) => {
          const address = isPackagePath(path) ? assets.get(path) : undefined;

          return address === undefined ? Result.fail(path) : Result.succeed(`${address}${params}`);
        },
      });
    }

    case "remote": {
      return Result.succeed(url.href);
    }

    case "srcset": {
      return Result.map(
        Result.all(
          url.candidates.map((candidate) =>
            Result.map(addressUrl(candidate.url, location, assets), (written) =>
              [written, ...candidate.descriptors].join(" "),
            ),
          ),
        ),
        (candidates) => candidates.join(", "),
      );
    }

    default: {
      return url satisfies never;
    }
  }
};

/**
 * Report whether a candidate URL written into a `srcset` would split back as the same URL. One
 * that starts or ends with a comma would not; the parser makes one only from a control character
 * beside a comma. A written URL is never empty: a blank candidate is dropped before it is written.
 *
 * @param written The candidate's URL as {@link formatUrl} writes it.
 * @returns Whether the `srcset` parser reads it back unchanged.
 */
const splitsBack = (written: string): boolean => !written.startsWith(",") && !written.endsWith(",");

/**
 * Classify a `srcset`: every candidate's URL as a resource, kept whole or dropped whole.
 *
 * @param value The attribute value as written.
 * @returns The candidates a browser reads, or the first candidate's reason to drop the attribute.
 *   A value a browser reads no candidate from, a blank one included, would be written empty, so it
 *   is dropped as {@link invalidUrlFeature}, as an empty value is in every context.
 */
const classifySrcset = (value: string): DroppedUrl | SrcsetUrl => {
  const candidates: SrcsetCandidate[] = [];
  for (const split of splitSrcset(value)) {
    const url = classifyFetched(split.url, true);
    if (url.kind === "dropped") {
      return url;
    }

    if (!splitsBack(formatUrl(url))) {
      return dropped(invalidUrlFeature);
    }

    if (validDescriptors(split.descriptors)) {
      candidates.push({ descriptors: split.descriptors, url });
    }
  }

  return candidates.length === 0 ? dropped(invalidUrlFeature) : { candidates, kind: "srcset" };
};

/**
 * Classify a URL attribute value in its context, wherever the item sits in its package.
 *
 * The value is resolved against a sentinel directory standing for the item's own directory. It is
 * kept when it is a package path (a relative path, which may climb above that directory), an
 * absolute `http` or `https` URL where the context admits remote URLs (`https` alone in the
 * package context), or a same-document fragment in the link context. Everything else is dropped
 * with its feature key: {@link schemeFeature} for any other scheme (`javascript:`, `data:`,
 * `mailto:`, `tel:`, and `http:` in the package context), {@link outsidePackageFeature} for `/x`,
 * `//host` and `\\host`, and {@link invalidUrlFeature} for a value the parser refuses and for a
 * blank one (empty, or only spaces and control characters). Whether a climb stays inside the
 * package depends on the item's location, which {@link classifyUrlAt} reads.
 *
 * Classifying a kept value's {@link formatUrl} form gives the same classification.
 *
 * @param context The attribute's context, from {@link urlContextOf}.
 * @param value The attribute value as written.
 * @returns The kept value in its parsed form, or the reason it is dropped.
 * @see https://url.spec.whatwg.org/#concept-basic-url-parser
 */
export const classifyUrl = (context: UrlContext, value: string): ClassifiedUrl => {
  switch (context) {
    case "embed": {
      return classifyFetched(value, false);
    }

    case "link": {
      return Option.match(fragmentOf(value), {
        onNone: () => classifyFetched(value, true),
        onSome: (fragment): FragmentUrl => ({ fragment, kind: "fragment" }),
      });
    }

    case "package": {
      const url = classifyFetched(value, true);

      // A remote URL's href is its parsed form, so its scheme is lower case: `http:` names the one
      // remote scheme the fetched rule keeps and this context does not.
      return url.kind === "remote" && url.href.startsWith("http:")
        ? dropped(schemeFeature("http"))
        : url;
    }

    case "resource": {
      return classifyFetched(value, true);
    }

    case "srcset": {
      return classifySrcset(value);
    }

    default: {
      return context satisfies never;
    }
  }
};

/**
 * Give the package paths a classified value keeps: the value itself when it is one, and each of a
 * `srcset`'s candidates that is one, in order.
 *
 * @param url The classification.
 * @returns The package paths; none for a dropped value, a remote URL and a fragment.
 */
const packageUrlsOf = (url: ClassifiedUrl): readonly PackageUrl[] => {
  switch (url.kind) {
    case "package": {
      return [url];
    }

    case "srcset": {
      return url.candidates.flatMap((candidate) =>
        candidate.url.kind === "package" ? [candidate.url] : [],
      );
    }

    case "dropped":
    case "fragment":
    case "remote": {
      return [];
    }

    default: {
      return url satisfies never;
    }
  }
};

/**
 * Classify a URL attribute value of the item at a location in its package, as `checkAdmitted` keeps
 * or drops it: {@link classifyUrl}'s classification, dropped whole as {@link outsidePackageFeature}
 * when a package path it keeps, a `srcset` candidate's included, climbs above the package root from
 * the item's directory, or from the package root for a PCI's module location ({@link
 * baseLocationOf}), since it names no file of the package (reading 102).
 *
 * @example
 *   classifyUrlAt("items/q1.xml", "resource", "../images/a.png"); // the package path ../images/a.png
 *   classifyUrlAt("q1.xml", "resource", "../images/a.png"); // dropped as url-outside-package
 *   classifyUrlAt("items/q1.xml", "package", "../modules/m"); // dropped as url-outside-package
 *
 * @param location The item's location, its path from the package root.
 * @param context The attribute's context, from {@link urlContextOf}.
 * @param value The attribute value as written.
 * @returns The kept value in its parsed form, or the reason it is dropped.
 */
export const classifyUrlAt = (
  location: string,
  context: UrlContext,
  value: string,
): ClassifiedUrl => {
  const url = classifyUrl(context, value);
  const base = baseLocationOf(location, context);

  return packageUrlsOf(url).every((each) => Option.isSome(assetReferenceOf(base, each)))
    ? url
    : dropped(outsidePackageFeature);
};

/**
 * Give the files a URL attribute of an item body names, as `<Item>` looks each up in the
 * configuration's `assets`: the value classified as `checkAdmitted` classifies it
 * ({@link classifyUrlAt}), then each package path it keeps, a `srcset`'s candidates in order,
 * resolved against the item's location, or the package root for a PCI's module location
 * ({@link baseLocationOf}, {@link assetReferenceOf}).
 *
 * A value plate drops, a remote URL, a same-document fragment and an attribute that is no URL
 * attribute of its element name no file. Pantry's importer resolves the same references to the
 * `ReferencePath` rows a host builds `assets` from, and a corpus differential in pantry holds the
 * two resolutions equal, so a file this names is a file those rows name.
 *
 * @example
 *   assetPaths("items/q1.xml", "img", "src", "media/a%20b.png"); // ["items/media/a b.png"]
 *   assetPaths("items/q1.xml", "img", "src", "../images/a.png"); // ["images/a.png"]
 *   assetPaths("items/q1.xml", "qti-interaction-module", "primary-path", "modules/m.js");
 *   // ["modules/m.js"]: a PCI's module location is a path from the package root
 *
 * @param location The item's location, its path from the package root.
 * @param element The body element's local name.
 * @param attribute The attribute's local name.
 * @param value The attribute's value as written.
 * @returns Each file's path from the package root, in order; empty when the value names none.
 */
export const assetPaths = (
  location: string,
  element: string,
  attribute: string,
  value: string,
): readonly string[] =>
  Option.match(
    urlContextOf({ local: element, namespace: qtiNamespace }, { local: attribute, namespace: "" }),
    {
      onNone: () => [],
      onSome: (context) =>
        packageUrlsOf(
          classifyUrlAt(
            location,
            context,
            urlValueOf(
              { local: element, namespace: qtiNamespace },
              { local: attribute, namespace: "" },
              value,
            ),
          ),
        ).flatMap((url) =>
          Option.toArray(
            Option.map(
              assetReferenceOf(baseLocationOf(location, context), url),
              (reference) => reference.path,
            ),
          ),
        ),
    },
  );
