/**
 * How a reference names a file of a package: RFC 3986 section 5.2's resolution, by which a kept
 * package URL names the file `assets` gives an address (`#plate/model/url.ts`), read through crust
 * from grizzle-text, the one resolution grizzle, pantry and plate share ({@link resolveIn}).
 *
 * A package keys each file by its real name, so each segment's percent escapes are read as
 * decoded: `items/a%20b.xml` names `items/a b.xml`, and `%2E%2E` climbs a directory as `..` does.
 * The path is split at `/` before it is decoded, so an escaped `/` stays data inside its segment
 * ({@link decodeSegment}).
 *
 * @module
 */
import { regex } from "arkregex";
import { resolveWithin } from "@qti-pie/crust/uri.ts";
import { Option, Result } from "effect";

/**
 * Take the part of a URI reference before its query and fragment.
 *
 * @param reference The reference.
 * @returns Its scheme, authority and path, whichever it has.
 */
export const withoutQuery = (reference: string): string =>
  reference.split(regex("[#?]", "u"), 1)[0] ?? "";

/**
 * A percent escape of `/`, in either case, captured so a split keeps it.
 */
const escapedSlash = regex("(?<slash>%2F)", "iu");

/**
 * Decode a path segment's percent escapes but those of `/`, which stay as written, and leave a
 * segment whose escapes are malformed as it is written.
 *
 * An escaped `/` is data inside its segment, never a separator (RFC 3986 section 2.2: a
 * percent-encoded reserved character is not equivalent to the character; reading
 * `href-resolution`). A package keys a file by one text whose segments `/` separates, which cannot
 * hold a `/` inside a segment, so the escape keeps its place in the segment: `a%2Fb.xml` names the
 * key `a%2Fb.xml`, never the file `b.xml` in the directory `a`. Its limit, a case no corpus package
 * has: `a%2Fb.xml` and `a%252Fb.xml` name one key, the file whose name is spelled `a%2Fb.xml`.
 *
 * @param segment The segment.
 * @returns The segment decoded.
 * @see https://www.rfc-editor.org/rfc/rfc3986#section-2.2
 */
const decodeSegment = (segment: string): string =>
  Result.getOrElse(
    Result.map(
      Result.all(
        segment
          .split(escapedSlash)
          .map((piece, index) =>
            index % 2 === 1 ? Result.succeed(piece) : Result.try(() => decodeURIComponent(piece)),
          ),
      ),
      (pieces) => pieces.join(""),
    ),
    () => segment,
  );

/**
 * A segment made of dots alone written as RFC 3986's dot segment, each `%2E` as the `.` it encodes,
 * since a segment is decoded before its dots are read: `%2E%2E` climbs a directory as `..` does.
 * Any other segment stays as written, decoded only once it is resolved ({@link decodeSegment}).
 */
const dotsOnly = regex("^(?:\\.|%2[Ee])+$", "u");

/**
 * Whether a path segment is one of RFC 3986's dot segments, `.` or `..`, each `%2E` read as the `.`
 * it encodes, as {@link resolveIn} reads it: resolved, a dot segment at a path's end names a
 * directory, never a file of it.
 *
 * @param segment The segment, as written.
 * @returns Whether it is `.` or `..`.
 * @see https://www.rfc-editor.org/rfc/rfc3986#section-5.2.4
 */
export const isDotSegment = (segment: string): boolean =>
  dotsOnly.test(segment) && segment.replaceAll(/%2[Ee]/gu, ".").length <= 2;

/**
 * Write a name of the location's path as a URI's path segment, each character RFC 3986's
 * resolution reads as syntax percent-escaped: `%` the escape itself first, `?` and `#` the query's
 * and the fragment's start, and `.` the dot segments' letter, so a name `..` stays a name. The
 * resolution never reads the name, and {@link decodeSegment} gives it back.
 *
 * @param name A segment of the location's path, as the package holds it.
 * @returns Its written form.
 */
const writtenNameOf = (name: string): string =>
  name.replaceAll("%", "%25").replaceAll("?", "%3F").replaceAll("#", "%23").replaceAll(".", "%2E");

/**
 * The package's root as the absolute URI a reference is resolved against (RFC 3986, section 5.1):
 * a scheme no reference is read under and an empty authority, so the package root is its path's
 * root, as `file:///` roots a file system, and a location whose first segment is empty is still a
 * path, never an authority.
 */
const packageUri = "package:///";

/**
 * Resolve a relative reference against a location inside a package, as RFC 3986 section 5.2
 * merges a relative path with its base's directory and removes its dot segments: by RFC 3986's own
 * resolution within the package (crust's `resolveWithin`, grizzle-text's), each segment's dots
 * read as decoded, `.` dropped, `..` climbing to the directory above, a dot segment at the end
 * naming the directory itself, the query and the fragment set aside, and each segment of the result
 * decoded ({@link decodeSegment}). The location's own segments are names, taken as written.
 *
 * A reference that starts with `/` names a path from a host's root, and one whose `..` climbs
 * above the package's root leaves the package: neither is inside, where RFC 3986 would drop the
 * extra `..`. The caller decides first what an absolute URI names: the reference is read below the
 * location's directory (`./`), so a `:` in its first segment is a name, never a scheme.
 *
 * @param location The path from the package's root the reference is relative to, `/` separating
 *   its segments; its last segment is the file the reference replaces.
 * @param reference The reference as written, not an absolute URI.
 * @returns The path it names from the package's root, or none when it is not inside.
 * @see https://www.rfc-editor.org/rfc/rfc3986#section-5.2
 */
export const resolveIn = (location: string, reference: string): Option.Option<string> => {
  const path = withoutQuery(reference);
  if (path.startsWith("/")) {
    return Option.none();
  }

  const resolved = resolveWithin(
    `${packageUri}${location.split("/").map(writtenNameOf).join("/")}`,
    `./${path
      .split("/")
      .map((segment) =>
        dotsOnly.test(segment) ? segment.replaceAll(regex("%2[Ee]", "gu"), ".") : segment,
      )
      .join("/")}`,
  );

  return resolved._tag === "Within"
    ? Option.some(resolved.target.slice(packageUri.length).split("/").map(decodeSegment).join("/"))
    : Option.none();
};
