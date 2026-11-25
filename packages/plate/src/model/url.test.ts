import { availableParallelism } from "node:os";
import { regex } from "arkregex";
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { word } from "@bjornpagen/testing/dictionary";
import { array, element as member, int, map } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option, Result } from "effect";
import { mathmlNamespace, qtiNamespace } from "#plate/document/source.ts";
import {
  addressUrl,
  assetPaths,
  classifyUrl,
  classifyUrlAt,
  formatUrl,
  isPackagePath,
  urlContextOf,
} from "#plate/model/url.ts";
import { boxHolds } from "#plate/test/box.ts";
import { assetsOf } from "#plate/test/fixtures.ts";
import type { KeptUrl, UrlContext } from "#plate/model/url.ts";
import { htmlAttributes } from "#plate/model/url.dictionary.ts";
import type { HtmlAttribute } from "#plate/model/url.dictionary.ts";

/**
 * A URL attribute value's classification, as {@link classifyUrl} gives it.
 */
type ClassifiedUrl = ReturnType<typeof classifyUrl>;

/**
 * A kept package path.
 */
type PackageUrl = Extract<KeptUrl, { readonly kind: "package" }>;

/**
 * A dropped value.
 */
type DroppedUrl = Extract<ClassifiedUrl, { readonly kind: "dropped" }>;

/**
 * The feature key of a URL that resolves outside the package.
 */
const outsidePackageFeature = "url-outside-package";

/**
 * The contexts that hold one URL, as opposed to a `srcset` list.
 */
const singleContexts = ["link", "resource", "embed"] as const;

/**
 * Construct a kept package-relative URL for a test.
 *
 * @param path Its written form below the package directory.
 * @returns The classification.
 */
const inPackage = (path: string): PackageUrl => ({ kind: "package", path });

/**
 * Construct a dropped URL for a test.
 *
 * @param feature The feature key it is dropped with.
 * @returns The classification.
 */
const dropped = (feature: string): DroppedUrl => ({ feature, kind: "dropped" });

/**
 * Name an element or an attribute.
 *
 * @param namespace Its namespace, `""` for none.
 * @param local Its local name.
 * @returns The expanded name.
 */
const name = (namespace: string, local: string) => ({ local, namespace });

/**
 * Look up the context of an attribute in no namespace on an element of a namespace.
 *
 * @param namespace The element's namespace.
 * @param element The element's local name.
 * @param attribute The attribute's local name.
 * @returns Its context, none when it is no URL attribute there.
 */
const contextAt = (namespace: string, element: string, attribute: string) =>
  urlContextOf(name(namespace, element), name("", attribute));

/**
 * How long one case of a search here may run before it is stopped and reported.
 */
const caseHang = Duration.seconds(30);

/**
 * A context that holds one URL.
 */
type SingleContext = (typeof singleContexts)[number];

/**
 * A case of a box of values held in each single context.
 */
interface ContextCase {
  readonly context: SingleContext;
  readonly value: string;
}

/**
 * Draw a case of the rooted box: one or two of the slash and the backslash, then a path of one or
 * two of `a` and `x`, in each single context.
 */
const rootedCase: Gen<ContextCase> = (source) => {
  const slashes = source.draw(array(member(["/", "\\"] as const), { max: 2, min: 1 }));
  const path = source.draw(array(member(["a", "x"] as const), { max: 2, min: 1 }));

  return {
    context: source.draw(member(singleContexts)),
    value: `${slashes.join("")}${path.join("/")}`,
  };
};

/**
 * How many cases {@link rootedCase} draws.
 */
const ROOTED_CASES = (2 + 4) * (2 + 4) * 3;

/**
 * The segments a path of the walked box passes through: a name, and dot segments written every
 * way the URL Standard reads one.
 */
const DOT_PIECES = ["a", ".", "..", "%2e", "%2E%2e", ".%2e"] as const;

/**
 * Draw a case of the walked box: up to three of {@link DOT_PIECES} and a last segment of `x`, `.`
 * or `..`, separated by slashes or by backslashes, bare or after `https:`, in each single context.
 */
const walkedCase: Gen<ContextCase> = (source) => {
  const prefix = source.draw(member(["", "https:"] as const));
  const separator = source.draw(member(["/", "\\"] as const));
  const middle = source.draw(array(member(DOT_PIECES), { max: 3, min: 0 }));
  const last = source.draw(member(["x", ".", ".."] as const));

  return {
    context: source.draw(member(singleContexts)),
    value: `${prefix}${[...middle, last].join(separator)}`,
  };
};

/**
 * How many cases {@link walkedCase} draws.
 */
const WALKED_CASES = 2 * 2 * (1 + 6 + 6 ** 2 + 6 ** 3) * 3 * 3;

/**
 * What a walk reaches that a classifier could write wrong.
 */
const walkSituations = ["climbs above", "stays below", "a directory"] as const;

/**
 * A {@link walkSituations} member.
 */
type WalkSituation = (typeof walkSituations)[number];

/**
 * Whether a segment is a single-dot segment as the URL Standard reads one: `.`, or `%2e` in any
 * case.
 *
 * @param segment The segment.
 * @returns Whether it is.
 */
const isSingleDot = (segment: string): boolean =>
  segment === "." || segment.toLowerCase() === "%2e";

/**
 * Whether a segment is a double-dot segment as the URL Standard reads one: `..`, `.%2e`, `%2e.`
 * or `%2e%2e`, in any case.
 *
 * @param segment The segment.
 * @returns Whether it is.
 */
const isDoubleDot = (segment: string): boolean => {
  const lower = segment.toLowerCase();

  return lower === ".." || lower === ".%2e" || lower === "%2e." || lower === "%2e%2e";
};

/**
 * A relative path's walk from the item's directory: how many directories above it the walk
 * climbs, and the segments it keeps below.
 */
interface Walked {
  readonly climbs: number;
  readonly kept: readonly string[];
}

/**
 * A relative path's walk from the item's directory, as the classifier writes it.
 */
interface Walk {
  readonly path: string;
  readonly situations: readonly WalkSituation[];
}

/**
 * Walk a relative path from the item's directory as the URL Standard's path state does (section
 * 4.4): a backslash is a slash in a special URL, a single-dot segment is dropped, a double-dot one
 * drops the segment before it or, with none, climbs one directory above. The package path the
 * classifier writes for it below the item's directory is one `../` for each directory climbed,
 * then the segments kept, a `/` after them where the path ends in a dot segment and so names a
 * directory, and `./` for the directory itself.
 *
 * @param relative The path, with no scheme.
 * @returns Its package path and the situations it reaches.
 */
const walkOf = (relative: string): Walk => {
  const segments = relative.replaceAll("\\", "/").split("/");
  const start: Walked = { climbs: 0, kept: [] };
  const { climbs, kept } = Arr.reduce(segments, start, (walk, segment): Walked => {
    if (isSingleDot(segment)) {
      return walk;
    }

    if (isDoubleDot(segment)) {
      return Arr.isReadonlyArrayNonEmpty(walk.kept)
        ? { climbs: walk.climbs, kept: walk.kept.slice(0, -1) }
        : { climbs: walk.climbs + 1, kept: walk.kept };
    }

    return { climbs: walk.climbs, kept: [...walk.kept, segment] };
  });
  const last = segments.at(-1) ?? "";
  const directory = isSingleDot(last) || isDoubleDot(last);
  const path = `${"../".repeat(climbs)}${kept.join("/")}${directory && kept.length > 0 ? "/" : ""}`;
  const situations: readonly (readonly [WalkSituation, boolean])[] = [
    ["climbs above", climbs > 0],
    ["stays below", climbs === 0],
    ["a directory", directory],
  ];

  return {
    path: path === "" ? "./" : path,
    situations: situations.flatMap(([situation, held]) => (held ? [situation] : [])),
  };
};

/**
 * The segments a path of the package-path box is made of: a name, the empty segment, both dot
 * segments, a percent-encoded letter, a space, and a name with two points inside it.
 */
const PATH_PIECES = ["a", "", ".", "..", "%41", " ", "a..b"] as const;

/**
 * Draw a path of the package-path box: every path of one to four of {@link PATH_PIECES}, joined by
 * slashes.
 */
const packagePath: Gen<string> = map(array(member(PATH_PIECES), { max: 4, min: 1 }), (segments) =>
  segments.join("/"),
);

/**
 * How many paths {@link packagePath} draws.
 */
const PACKAGE_PATHS = 7 + 7 ** 2 + 7 ** 3 + 7 ** 4;

/**
 * The segments a reference of the reference box passes through before its file: a name, both dot
 * segments, `..` percent-encoded, a segment that looks like an authority, one that looks like a
 * port, and a name with a space.
 */
const REFERENCE_PIECES = ["media", ".", "..", "%2e%2e", "@evil.com", ":8080", "a b"] as const;

/**
 * Draw a reference of the reference box: up to two of {@link REFERENCE_PIECES}, then `a.png`.
 */
const referenceValue: Gen<string> = map(
  array(member(REFERENCE_PIECES), { max: 2, min: 0 }),
  (segments) => [...segments, "a.png"].join("/"),
);

/**
 * How many references {@link referenceValue} draws.
 */
const REFERENCES = 1 + 7 + 7 ** 2;

/**
 * A case of the address box: a package path, the query and fragment after it, and the item's
 * location.
 */
interface AddressCase {
  readonly location: string;
  readonly params: string;
  readonly path: string;
}

/**
 * Draw a case of the address box: an item at the package root, in `items` or in `items/deep`, and
 * a package path of up to two of `media`, `..`, `a%20b` and `%C3%A9` before `a.png`, bare or after
 * `./`, with no query or fragment, `?v=1`, `#x` or `?v=1#x`.
 */
const addressCase: Gen<AddressCase> = (source) => {
  const depth = source.draw(int(0, 2));
  const start = source.draw(member(["", "./"] as const));
  const middle = source.draw(
    array(member(["media", "..", "a%20b", "%C3%A9"] as const), { max: 2, min: 0 }),
  );

  return {
    location: [...["items", "deep"].slice(0, depth), "q1.xml"].join("/"),
    params: source.draw(member(["", "?v=1", "#x", "?v=1#x"] as const)),
    path: `${start}${[...middle, "a.png"].join("/")}`,
  };
};

/**
 * How many cases {@link addressCase} draws.
 */
const ADDRESS_CASES = 3 * 2 * (1 + 4 + 4 ** 2) * 4;

/**
 * A case of the attribute box: an HTML attribute and the value it holds.
 */
interface AttributeCase {
  readonly attribute: HtmlAttribute;
  readonly value: string;
}

/**
 * Draw a URL of the attribute box: none, a slash, a remote origin or another scheme before up to
 * two of `media`, `..` and `a%20b` and then `a.png`, with no fragment or `#v`.
 */
const attributeUrl: Gen<string> = (source) => {
  const start = source.draw(member(["", "/", "https://r.example/", "mailto:"] as const));
  const middle = source.draw(array(member(["media", "..", "a%20b"] as const), { max: 2, min: 0 }));
  const fragment = source.draw(member(["", "#v"] as const));

  return `${start}${[...middle, "a.png"].join("/")}${fragment}`;
};

/**
 * Draw a srcset of the attribute box: one or two candidates, each `a.png`, `../a.png` or
 * `../../b.png`, bare or on a remote origin, with its density, 1x then 2x.
 */
const attributeSrcset: Gen<string> = map(
  array(
    (source) =>
      `${source.draw(member(["", "https://r.example/"] as const))}${source.draw(member(["a.png", "../a.png", "../../b.png"] as const))}`,
    { max: 2, min: 1 },
  ),
  (urls) => urls.map((url, at) => `${url} ${String(at + 1)}x`).join(", "),
);

/**
 * Draw a case of the attribute box: each of {@link htmlAttributes}, holding a srcset where it is a
 * srcset and a URL of {@link attributeUrl} elsewhere.
 */
const attributeCase: Gen<AttributeCase> = (source) => {
  const attribute = source.draw(word(htmlAttributes));

  return {
    attribute,
    value: source.draw(attribute.context === "srcset" ? attributeSrcset : attributeUrl),
  };
};

/**
 * How many cases {@link attributeCase} draws: six attributes by 4 * 13 * 2 URLs, and the srcset
 * attribute by 6 + 6 * 6 lists.
 */
const ATTRIBUTE_CASES = 6 * 4 * (1 + 3 + 3 ** 2) * 2 + (6 + 6 * 6);

/**
 * Whether a value is a relative path: no scheme (RFC 3986 section 3.1: a letter, then letters,
 * digits, `+`, `-` or `.`, then a colon, before any `/`, `?` or `#`) and no slash first.
 *
 * @param value The value.
 * @returns Whether it is a relative path.
 */
const isRelativePath = (value: string): boolean => {
  const colon = value.indexOf(":");
  const beforeColon = value.slice(0, Math.max(colon, 0));
  const hasScheme =
    colon > 0 &&
    !beforeColon.includes("/") &&
    !beforeColon.includes("?") &&
    !beforeColon.includes("#");

  return !hasScheme && !value.startsWith("/");
};

/**
 * The files an attribute's value names, by the oracle: none for an attribute that holds no URL, a
 * value with a scheme or a slash first; a relative path's file, its fragment apart, as the suite's
 * RFC 3986 transcription resolves it from `items/q1.xml` ({@link fileByRfc3986}); and a srcset's
 * candidates' files in order where every candidate names one, none where any does not.
 *
 * @param attribute The attribute.
 * @param value Its value.
 * @returns The files, from the package root.
 */
const attributeFiles = (attribute: HtmlAttribute, value: string): readonly string[] => {
  const fileOf = (url: string): readonly string[] =>
    isRelativePath(url) ? fileByRfc3986("items/q1.xml", url.split("#")[0] ?? url) : [];

  if (attribute.context === "none") {
    return [];
  }

  if (attribute.context !== "srcset") {
    return fileOf(value);
  }

  const files = value.split(", ").map((entry) => fileOf(entry.split(" ")[0] ?? entry));

  return files.every((named) => named.length === 1) ? files.flat() : [];
};

describe("urlContextOf", () => {
  it("names each body attribute's context, and none for param@value or an undeclared pair", () => {
    assert.deepStrictEqual(
      contextAt(qtiNamespace, "source", "srcset"),
      Option.some<UrlContext>("srcset"),
    );
    assert.deepStrictEqual(
      contextAt(qtiNamespace, "img", "longdesc"),
      Option.some<UrlContext>("link"),
    );
    assert.deepStrictEqual(
      contextAt(qtiNamespace, "object", "data"),
      Option.some<UrlContext>("embed"),
    );
    assert.deepStrictEqual(contextAt(qtiNamespace, "param", "value"), Option.none());
    assert.deepStrictEqual(contextAt(qtiNamespace, "a", "src"), Option.none());
  });

  it("names MathML 3's URL attributes: href on every element, altimg, and mglyph's, annotation's and share's src", () => {
    assert.deepStrictEqual(
      contextAt(mathmlNamespace, "mi", "href"),
      Option.some<UrlContext>("link"),
    );
    assert.deepStrictEqual(
      contextAt(mathmlNamespace, "math", "href"),
      Option.some<UrlContext>("link"),
    );
    assert.deepStrictEqual(
      contextAt(mathmlNamespace, "math", "altimg"),
      Option.some<UrlContext>("resource"),
    );
    assert.deepStrictEqual(
      contextAt(mathmlNamespace, "mglyph", "src"),
      Option.some<UrlContext>("resource"),
    );
    assert.deepStrictEqual(
      contextAt(mathmlNamespace, "annotation", "src"),
      Option.some<UrlContext>("resource"),
    );
    assert.deepStrictEqual(
      contextAt(mathmlNamespace, "share", "src"),
      Option.some<UrlContext>("link"),
    );
    assert.deepStrictEqual(contextAt(mathmlNamespace, "ci", "definitionURL"), Option.none());
  });
});

describe("classifyUrl", () => {
  it.effect(
    `drops every value that starts with a slash or a backslash as url-outside-package in every context: ${String(ROOTED_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(rootedCase, ROOTED_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "every value of one or two of the slash and the backslash before a path of one or two of a and x, in the link, resource and embed contexts",
              caseHang,
              coverage: requiredInSpace<"rooted" | "a host">(["rooted", "a host"]),
              generator: rootedCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "the URL Standard's relative states (section 4.4): a value with no scheme is read against the item's directory, a slash or a backslash, the separator a special URL reads for it, first starts the path at the root, and two start a host, so either names a file outside the package, url-outside-package, in every context, the link context's remote URLs being only values that are absolute by themselves",
              },
              suite: "plate/url/rooted",
            },
            ({ context, value }, c) =>
              Effect.sync(() => {
                const second = value.charAt(1);
                c.note(second === "/" || second === "\\" ? "a host" : "rooted");

                assert.deepStrictEqual(
                  classifyUrl(context, value),
                  dropped(outsidePackageFeature),
                  `${JSON.stringify(value)} in ${context}`,
                );
              }),
          ),
        ),
      ),
  );

  it.effect(
    `keeps every relative path of dot segments as the package path its walk names, one ../ for each directory it climbs above the item's: ${String(WALKED_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(walkedCase, WALKED_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "every path of up to three of a, ., .., %2e, %2E%2e and .%2e and a last segment of x, . or .., separated by slashes or by backslashes, bare or after https:, in the link, resource and embed contexts",
              caseHang,
              concurrency: availableParallelism(),
              coverage: requiredInSpace<WalkSituation>(walkSituations),
              generator: walkedCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "the URL Standard's path state (section 4.4), transcribed here: a special URL reads a backslash as a slash, https: before a path of a base of that scheme is a relative reference, a single-dot segment (., %2e) is dropped and a double-dot one (.., .%2e, %2e., %2e%2e) drops the segment before it; the classifier writes the package path below the item's directory, one ../ for each directory the walk climbs above it, a path ending in a dot segment a directory, ./ the directory itself",
              },
              suite: "plate/url/walked",
            },
            ({ context, value }, c) =>
              Effect.sync(() => {
                const walked = walkOf(value.startsWith("https:") ? value.slice(6) : value);
                c.noteAll(walked.situations);

                assert.deepStrictEqual(
                  classifyUrl(context, value),
                  inPackage(walked.path),
                  `${JSON.stringify(value)} in ${context}`,
                );
              }),
          ),
        ),
      ),
  );
});

describe("isPackagePath", () => {
  it.effect(
    `holds exactly for a path from the package root to a file, a space, a % or an empty interior segment in it included, over every path of up to four segments: ${String(PACKAGE_PATHS)} paths`,
    (ctx) =>
      Effect.andThen(
        boxHolds(packagePath, PACKAGE_PATHS),
        searched(
          ctx,
          exhaust(
            {
              box: "every path of 1 to 4 segments, each a, empty, ., .., %41, a space or a..b, joined by slashes",
              caseHang,
              coverage: requiredInSpace<"a package path" | "no package path">([
                "a package path",
                "no package path",
              ]),
              generator: packagePath,
              literal: (path) => JSON.stringify(path),
              oracle: {
                kind: "specification",
                name: "RFC 3986 section 3.3: path-rootless = segment-nz *( \"/\" segment ) and segment = *pchar, so a path's first segment has a character and a later one may have none; a file's path ends in a segment of its own, and names it with no dot segment",
              },
              suite: "plate/url/package-paths",
            },
            (path, c) =>
              Effect.sync(() => {
                const segments = path.split("/");
                const holds =
                  segments[0] !== "" &&
                  segments.at(-1) !== "" &&
                  segments.every((segment) => segment !== "." && segment !== "..");
                c.note(holds ? "a package path" : "no package path");

                assert.strictEqual(isPackagePath(path), holds, JSON.stringify(path));
              }),
          ),
        ),
      ),
  );

  it("fails for an empty path, a rooted one, a directory, and one with a . or .. segment", () => {
    for (const path of [
      "",
      "/a.png",
      "//a.png",
      "./a.png",
      "items/./a.png",
      "items/../a.png",
      "..",
      "a/..",
      "items/",
      "items//",
    ]) {
      assert.isFalse(isPackagePath(path), path);
    }
  });
});

describe("resolution against the item's location", () => {
  it("names and addresses an entry whose path holds an empty segment, as the package that holds it does", () => {
    assert.deepStrictEqual(
      assetPaths("item.xml", "img", "src", "media//a.png"),
      ["media//a.png"],
      "S7's package: `item.xml` writes `<img src=\"media//a.png\">`, and its zip and its manifest's cp:file name the entry `media//a.png`, which pantry stores.",
    );
    assert.deepStrictEqual(
      addressUrl(
        inPackage("media//a.png"),
        "item.xml",
        assetsOf([["media//a.png", "https://cdn.example/sha256/7"]]),
      ),
      Result.succeed("https://cdn.example/sha256/7"),
    );
  });

  it.effect(
    `names the file a package path names from the item's directory, each segment percent-decoded, its query and fragment apart, over every path of the address box in an item at each depth: ${String(ADDRESS_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(addressCase, ADDRESS_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "every package path of up to two of media, .., a%20b and %C3%A9 before a.png, bare or after ./, with no query or fragment, ?v=1, #x or ?v=1#x, in an item at the package root, in items and in items/deep",
              caseHang,
              coverage: requiredInSpace<"addressed" | "above the root">([
                "addressed",
                "above the root",
              ]),
              generator: addressCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "RFC 3986, by the suite's transcription (fileByRfc3986): the path resolved against the item's location, each segment percent-decoded, names the file whose address assets gives, its query and fragment written after it; a path that climbs above the package root names no file, so addressUrl gives it missing, the item's directory and the path as written (reading `href-resolution`)",
              },
              suite: "plate/url/addressed",
            },
            ({ location, params, path }, c) =>
              Effect.sync(() => {
                const files = fileByRfc3986(location, path);
                c.note(files.length === 0 ? "above the root" : "addressed");

                assert.deepStrictEqual(
                  addressUrl(
                    inPackage(`${path}${params}`),
                    location,
                    assetsOf(files.map((file) => [file, "https://cdn.example/f"])),
                  ),
                  files.length === 0
                    ? Result.fail({
                        kind: "missing",
                        path: [...location.split("/").slice(0, -1), path].join("/"),
                      })
                    : Result.succeed(`https://cdn.example/f${params}`),
                  `${path}${params} in ${location}`,
                );
              }),
          ),
        ),
      ),
  );

  it("names a directory for a path that ends in one, and no file for one that climbs above the package root", () => {
    for (const [location, value, files] of [
      ["items/q1.xml", "./", ["items/"]],
      ["items/q1.xml", "../", [""]],
      ["q1.xml", "../a.png", []],
      ["items/q1.xml", "../../a.png", []],
      ["items/q1.xml", "../../items/a.png", []],
    ] as const) {
      assert.deepStrictEqual(assetPaths(location, "img", "src", value), files, value);
    }
  });

  it.effect(
    `resolves the value check writes for a reference to the file the reference names, over every reference of up to two segments before a file: ${String(REFERENCES)} references`,
    (ctx) =>
      Effect.andThen(
        boxHolds(referenceValue, REFERENCES),
        searched(
          ctx,
          exhaust(
            {
              box: "every reference in items/q1.xml of up to two of media, ., .., %2e%2e, @evil.com, :8080 and a b, then a.png",
              caseHang,
              coverage: requiredInSpace<"in the package" | "above its root">([
                "in the package",
                "above its root",
              ]),
              generator: referenceValue,
              literal: (value) => JSON.stringify(value),
              oracle: {
                kind: "specification",
                name: "RFC 3986, by the suite's transcription (fileByRfc3986): the reference's percent-encoded unreserved characters normalized (section 6.2.2.2, so %2e is a .), resolved against the item's location (section 5.2), each segment percent-decoded (section 2.1); a segment that looks like an authority or a port is a name like any other, and a path that climbs above the package root names no file of it (reading `href-resolution`)",
              },
              suite: "plate/url/check-written",
            },
            (value, c) =>
              Effect.sync(() => {
                const files = fileByRfc3986("items/q1.xml", value);
                c.note(files.length === 0 ? "above its root" : "in the package");

                const kept = classifyUrl("resource", value);

                assert.deepStrictEqual(
                  kept.kind === "package"
                    ? assetPaths("items/q1.xml", "img", "src", formatUrl(kept))
                    : kept,
                  files,
                  JSON.stringify(value),
                );
              }),
          ),
        ),
      ),
  );
});

describe("addressUrl", () => {
  it("writes a path that climbs above the item's directory as the address of the file it names", () => {
    const beside = assetsOf([["images/a.png", "https://cdn.example/sha256/6"]]);
    assert.deepStrictEqual(
      addressUrl(inPackage("../images/a.png#x"), "items/q1.xml", beside),
      Result.succeed("https://cdn.example/sha256/6#x"),
    );
    assert.deepStrictEqual(
      addressUrl(inPackage("../../images/a.png"), "items/q1.xml", beside),
      Result.fail({ kind: "missing", path: "items/../../images/a.png" }),
    );
  });
});

describe("assetPaths", () => {
  it.effect(
    `names each file a URL attribute's package paths name, a srcset's in order, and none for any other value, over every value of the attribute box on each HTML attribute: ${String(ATTRIBUTE_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(attributeCase, ATTRIBUTE_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "on each of htmlAttributes, in items/q1.xml: every value of none, a slash, https://r.example/ or javascript: before up to two of media, .. and a%20b and then a.png, with no fragment or #v; on a srcset, every list of one or two candidates, each a.png, ../a.png or ../../b.png, bare or remote, with its density",
              caseHang,
              coverage: requiredInSpace<"files" | "no file">(["files", "no file"]),
              generator: attributeCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "an attribute that holds no URL names no file; a value with a scheme (RFC 3986 section 3.1) or that starts with a slash names none, a remote link included, which no host serves from the package; a relative path names the file the suite's RFC 3986 transcription resolves from the item's location (fileByRfc3986), its fragment apart, none above the package root (reading `href-resolution`); a srcset names its candidates' files in order where every candidate names one, and none where any does not",
              },
              suite: "plate/url/asset-paths",
            },
            ({ attribute, value }, c) =>
              Effect.sync(() => {
                const files = attributeFiles(attribute, value);
                c.note(files.length === 0 ? "no file" : "files");

                assert.deepStrictEqual(
                  assetPaths("items/q1.xml", attribute.element, attribute.attribute, value),
                  files,
                  `${attribute.element}@${attribute.attribute}="${value}"`,
                );
              }),
          ),
        ),
      ),
  );
});

describe("a PCI's module locations", () => {
  it("are paths from the package root for an item in a subfolder, by reading `pci-module-locations`", () => {
    // Implementation guide §3.7.12.2: "Otherwise it should be assumed to be a QTI content package
    // relative path", the default configuration read from "<content package base
    // href>/modules/module_resolution.js". Information model §5.77.1: "Relative URLs indicate
    // relative paths in the QTI content package".
    const item = "items/counter.xml";

    assert.deepStrictEqual(
      assetPaths(
        item,
        "qti-interaction-modules",
        "primary-configuration",
        "modules/module_resolution.js",
      ),
      ["modules/module_resolution.js"],
    );
    assert.deepStrictEqual(
      assetPaths(item, "qti-interaction-module", "primary-path", "modules/counter.js"),
      ["modules/counter.js"],
    );
    assert.deepStrictEqual(
      classifyUrlAt(item, "package", "modules/counter"),
      inPackage("modules/counter"),
    );
    assert.deepStrictEqual(
      classifyUrlAt(item, "package", "../modules/counter"),
      dropped(outsidePackageFeature),
    );
  });
});

/**
 * The components of a URI reference, as RFC 3986 Appendix B's regular expression splits it, an
 * absent component `undefined`.
 */
interface Components {
  readonly authority: string | undefined;
  readonly fragment: string | undefined;
  readonly path: string;
  readonly query: string | undefined;
  readonly scheme: string | undefined;
}

/**
 * Split a URI reference into its five components (RFC 3986, Appendix B).
 *
 * @param reference The reference.
 * @returns Its components.
 * @see https://www.rfc-editor.org/rfc/rfc3986#appendix-B
 */
const componentsOf = (reference: string): Components => {
  const {
    authority,
    fragment,
    path = "",
    query,
    scheme,
  } = regex(
    "^(?:(?<scheme>[^#/:?]+):)?(?://(?<authority>[^#/?]*))?(?<path>[^#?]*)(?:\\?(?<query>[^#]*))?(?:#(?<fragment>.*))?",
    "u",
  ).exec(reference)?.groups ?? {};

  return { authority, fragment, path, query, scheme };
};

/**
 * Remove a path's dot segments, RFC 3986 section 5.2.4's loop as written.
 *
 * @param path The path.
 * @returns The output buffer.
 * @see https://www.rfc-editor.org/rfc/rfc3986#section-5.2.4
 */
const removeDotSegments = (path: string): string => {
  let input = path;
  let output = "";
  while (input !== "") {
    if (input.startsWith("../")) {
      input = input.slice(3);
    } else if (input.startsWith("./")) {
      input = input.slice(2);
    } else if (input.startsWith("/./")) {
      input = input.slice(2);
    } else if (input === "/.") {
      input = "/";
    } else if (input.startsWith("/../")) {
      input = input.slice(3);
      output = output.slice(0, Math.max(0, output.lastIndexOf("/")));
    } else if (input === "/..") {
      input = "/";
      output = output.slice(0, Math.max(0, output.lastIndexOf("/")));
    } else if (input === "." || input === "..") {
      input = "";
    } else {
      const end = input.indexOf("/", 1);
      const segment = end === -1 ? input : input.slice(0, end);
      output += segment;
      input = input.slice(segment.length);
    }
  }

  return output;
};

/**
 * Transform a reference's components into its target's, RFC 3986 section 5.2.2's strict
 * transform with section 5.2.3's merge, as written.
 *
 * @param b The base URI's components.
 * @param r The reference's components.
 * @returns The target's components.
 * @see https://www.rfc-editor.org/rfc/rfc3986#section-5.2.2
 */
const transformed = (b: Components, r: Components): Components => {
  if (r.scheme !== undefined) {
    return { ...r, path: removeDotSegments(r.path) };
  }

  if (r.authority !== undefined) {
    return { ...r, path: removeDotSegments(r.path), scheme: b.scheme };
  }

  if (r.path === "") {
    return { ...b, fragment: r.fragment, query: r.query ?? b.query };
  }

  const merged =
    b.authority !== undefined && b.path === ""
      ? `/${r.path}`
      : `${b.path.slice(0, b.path.lastIndexOf("/") + 1)}${r.path}`;

  return {
    ...b,
    fragment: r.fragment,
    path: removeDotSegments(r.path.startsWith("/") ? r.path : merged),
    query: r.query,
  };
};

/**
 * Resolve a URI reference against a base URI by RFC 3986 section 5.2, then recompose it (section
 * 5.3). It shares no code with `url.ts` and reads no WHATWG URL.
 *
 * @param base The base URI.
 * @param reference The reference.
 * @returns The target URI.
 * @see https://www.rfc-editor.org/rfc/rfc3986#section-5.3
 */
const resolveReference = (base: string, reference: string): string => {
  const target = transformed(componentsOf(base), componentsOf(reference));

  return [
    target.scheme === undefined ? "" : `${target.scheme}:`,
    target.authority === undefined ? "" : `//${target.authority}`,
    target.path,
    target.query === undefined ? "" : `?${target.query}`,
    target.fragment === undefined ? "" : `#${target.fragment}`,
  ].join("");
};

/**
 * The directory the oracle places a package's root at. No generated reference spells its name, so
 * a reference that climbs out of it never climbs back in.
 */
const oracleRoot = "http://host/package-root/";

/**
 * Give the file a relative reference in an item names, by RFC 3986: the reference's percent-encoded
 * unreserved characters normalized first (section 6.2.2.2, so `%2e` is a `.`), resolved against the
 * item's URI under {@link oracleRoot}, then each segment percent-decoded (section 2.1). Reading
 * `href-resolution` states each step for pantry and plate alike: a path that climbs above the
 * package root resolves outside it, and names no file of it.
 *
 * @param location The item's path from the package root.
 * @param reference The reference, a relative path with no query or fragment.
 * @returns The file's path from the package root, or none when it leaves the package.
 */
const fileByRfc3986 = (location: string, reference: string): readonly string[] => {
  const unreserved = reference.replaceAll(
    regex("%(?<hex>[\\dA-Fa-f]{2})", "gu"),
    (escape, hex: string) => {
      const character = String.fromCodePoint(Number.parseInt(hex, 16));

      return regex("^[\\w.~-]$", "u").test(character) ? character : escape;
    },
  );
  const target = resolveReference(`${oracleRoot}${location}`, unreserved);

  return target.startsWith(oracleRoot)
    ? [target.slice(oracleRoot.length).split("/").map(decodeURIComponent).join("/")]
    : [];
};

describe("resolution against the item's location, by RFC 3986", () => {
  it("names, for every path of up to four segments in items at four depths, the file RFC 3986 resolves it to", () => {
    /**
     * The names include the item's own folders and short names a resolver could mistake for its
     * own, so a climb back into the folder it left is told apart from a path that never left.
     */
    const segments = [".", "..", "%2e%2E", "a", "b", "root", "items", "c%20d.png"];
    const locations = ["q1.xml", "items/q1.xml", "items/deep/q1.xml", "a/b/q1.xml"];
    let paths: readonly string[] = [""];
    const references: string[] = [];
    for (let length = 1; length <= 4; length += 1) {
      paths = paths.flatMap((path) =>
        segments.map((segment) => (path === "" ? segment : `${path}/${segment}`)),
      );
      for (const path of paths) {
        references.push(path);
      }
      for (const path of paths) {
        references.push(`/${path}`);
      }
    }

    const disagreements = locations.flatMap((location) =>
      references.flatMap((reference) => {
        const plate = assetPaths(location, "img", "src", reference);
        const rfc = fileByRfc3986(location, reference);

        return plate.length === rfc.length && plate.every((file, index) => file === rfc[index])
          ? []
          : [
              `${reference} in ${location}: plate ${JSON.stringify(plate)}, RFC ${JSON.stringify(rfc)}`,
            ];
      }),
    );

    assert.deepStrictEqual(disagreements, []);
    assert.isAbove(references.length, 9000);
  });
});

/**
 * Replace each tab, line feed and carriage return of a value with a space, XML Schema's `replace`.
 *
 * @param value The value.
 * @returns It replaced.
 */
const replacedSpace = (value: string): string => value.replaceAll(regex("[\t\n\r]", "gu"), " ");

describe("a URL attribute's value, read by its type's whiteSpace facet", () => {
  it("names, for every URL attribute of the ASI XSD and every run of whitespace around and inside a name, the file the attribute's value names", () => {
    // Oracle: XML Schema 1.0 Part 2 §4.3.6 by hand. `replace`: "All occurrences of #x9 (tab), #xA
    // (line feed) and #xD (carriage return) are replaced with #x20 (space)"; `collapse`: "After the
    // processing implied by replace, contiguous sequences of #x20's are collapsed to a single #x20,
    // and initial and/or final #x20's are deleted"; `preserve`: "No normalization is done". Each
    // type is the ASI XSD's: `xs:anyURI` collapses (§3.2.17), `URLDType` is an
    // `xs:normalizedString`, which replaces, and `object@data` is an `xs:string`. The whitespace
    // around the value is then set aside, as an HTML URL is "potentially surrounded by spaces".
    const facets = {
      collapse: (value: string) => replacedSpace(value).replaceAll(/ +/gu, " ").trim(),
      preserve: (value: string) => value,
      replace: replacedSpace,
    } as const;
    const rows = [
      ["a", "href", "collapse", "items/"],
      ["audio", "src", "replace", "items/"],
      ["blockquote", "cite", "collapse", "items/"],
      ["img", "longdesc", "collapse", "items/"],
      ["img", "src", "collapse", "items/"],
      ["object", "data", "preserve", "items/"],
      ["q", "cite", "collapse", "items/"],
      ["qti-assessment-stimulus-ref", "href", "collapse", "items/"],
      ["qti-interaction-module", "fallback-path", "collapse", ""],
      ["qti-interaction-module", "primary-path", "collapse", ""],
      ["qti-interaction-modules", "primary-configuration", "collapse", ""],
      ["qti-interaction-modules", "secondary-configuration", "collapse", ""],
      ["source", "src", "replace", "items/"],
      ["track", "src", "replace", "items/"],
      ["video", "poster", "replace", "items/"],
      ["video", "src", "replace", "items/"],
    ] as const;
    const around = ["", " ", "\t", "\n", "\r"];
    const inside = ["", " ", "  ", "\t", " \t", "\n\r"];
    const lexicals = around.flatMap((before) =>
      inside.flatMap((within) =>
        ["", " ", "\t"].map((after) => `${before}a${within}b.png${after}`),
      ),
    );
    // An `xs:string` that holds a tab, a line feed or a carriage return inside names no file: the
    // database refuses it under "Href form" (pantry's spec reading `href-resolution`), so plate never meets one.
    const held = (facet: keyof typeof facets, lexical: string): boolean =>
      facet !== "preserve" ||
      !/[\t\n\r]/u.test(lexical.replaceAll(/^[\t\n\r ]+|[\t\n\r ]+$/gu, ""));
    const disagreements = rows.flatMap(([element, attribute, facet, directory]) =>
      lexicals
        .filter((lexical) => held(facet, lexical))
        .flatMap((lexical) => {
          const value = facets[facet](lexical)
            .replace(/^[\t\n\r ]+/u, "")
            .replace(/[\t\n\r ]+$/u, "");
          const expected = [`${directory}${value}`];
          const plate = assetPaths("items/q1.xml", element, attribute, lexical);

          return plate.length === 1 && plate[0] === expected[0]
            ? []
            : [
                `${element}@${attribute}=${JSON.stringify(lexical)}: plate ${JSON.stringify(plate)}, the ${facet}d value ${JSON.stringify(expected)}`,
              ];
        }),
    );

    assert.deepStrictEqual(disagreements, []);
    assert.strictEqual(rows.length * lexicals.length, 1440);
  });
});
