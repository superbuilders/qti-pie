import { assert, describe, it } from "@effect/vitest";
import { Option, Result } from "effect";
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
import { assetsOf } from "#plate/test/fixtures.ts";
import type { KeptUrl, UrlContext } from "#plate/model/url.ts";

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
  for (const value of ["//host/x", "\\\\host\\x", "/x", "/a/x", "/root/x"]) {
    it(`drops ${JSON.stringify(value)} as url-outside-package in every context`, () => {
      for (const context of singleContexts) {
        assert.deepStrictEqual(
          classifyUrl(context, value),
          dropped(outsidePackageFeature),
          context,
        );
      }
    });
  }

  it("keeps a path that climbs above the item's directory, one ../ for each directory it climbs", () => {
    const cases = [
      ["../x", "../x"],
      ["images/../../x", "../x"],
      ["../../images/a b.png?v=1#t", "../../images/a%20b.png?v=1#t"],
      ["..\\..\\x", "../../x"],
      ["%2e%2e/x", "../x"],
      ["..", "../"],
      ["../a/../..", "../../"],
      ["https:../x", "../x"],
    ] as const;
    for (const [value, path] of cases) {
      for (const context of singleContexts) {
        assert.deepStrictEqual(
          classifyUrl(context, value),
          inPackage(path),
          `${value} in ${context}`,
        );
      }
    }
  });
});

describe("isPackagePath", () => {
  it("holds for a path from the package root, a space, a % or an empty interior segment in it included", () => {
    // RFC 3986 section 3.3: `path-rootless = segment-nz *( "/" segment )` and `segment = *pchar`,
    // so a path's first segment has a character and a later one may have none.
    for (const path of [
      "a.png",
      "items/media/a b.png",
      "items/%41.png",
      "items/a..b/c.png",
      "media//a.png",
      "a///b.png",
    ]) {
      assert.isTrue(isPackagePath(path), path);
    }
  });

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
    // S7's package: `item.xml` writes `<img src="media//a.png">`, and its zip and its manifest's
    // cp:file name the entry `media//a.png`, which pantry stores.
    assert.deepStrictEqual(assetPaths("item.xml", "img", "src", "media//a.png"), ["media//a.png"]);
    assert.deepStrictEqual(
      addressUrl(
        inPackage("media//a.png"),
        "item.xml",
        assetsOf([["media//a.png", "https://cdn.example/sha256/7"]]),
      ),
      Result.succeed("https://cdn.example/sha256/7"),
    );
  });

  it("names the file a package path names from the item's directory, each segment percent-decoded, its query and fragment apart", () => {
    const cases = [
      ["items/q1.xml", "media/a%20b.png", "items/media/a b.png", ""],
      ["items/q1.xml", "media/%C3%A9.png", "items/media/é.png", ""],
      ["items/q1.xml", "asl/item123.mp4#t=00:00:16.0", "items/asl/item123.mp4", "#t=00:00:16.0"],
      ["items/q1.xml", "a.png?v=1#x", "items/a.png", "?v=1#x"],
      ["items/q1.xml", "./@evil.com/x", "items/@evil.com/x", ""],
      ["items/q1.xml", "./javascript:x", "items/javascript:x", ""],
      ["items/deep/q1.xml", "../x.png", "items/x.png", ""],
      ["items/q1.xml", "../images/a.png", "images/a.png", ""],
      ["q1.xml", "media/a.png", "media/a.png", ""],
      ["items/q1.xml", "a%ZZ.png", "items/a%ZZ.png", ""],
    ] as const;
    for (const [location, path, file, params] of cases) {
      assert.deepStrictEqual(
        addressUrl(inPackage(path), location, assetsOf([[file, "https://cdn.example/f"]])),
        Result.succeed(`https://cdn.example/f${params}`),
        `${path} in ${location}`,
      );
    }
  });

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

  it("resolves the value check writes for a reference to the file the reference names", () => {
    const cases = [
      ["media/a b.png", "items/media/a b.png"],
      ["./media/./a.png", "items/media/a.png"],
      ["media/sub/../a.png", "items/media/a.png"],
      ["media/%2e%2e/a.png", "items/a.png"],
      ["@evil.com/x", "items/@evil.com/x"],
      [":8080/x", "items/:8080/x"],
      ["https:evil.com/x", "items/evil.com/x"],
      ["../images/a.png", "images/a.png"],
      ["media/../../images/a.png", "images/a.png"],
    ] as const;
    for (const [value, file] of cases) {
      const kept = classifyUrl("resource", value);
      assert.strictEqual(kept.kind, "package", value);
      if (kept.kind === "package") {
        assert.deepStrictEqual(
          assetPaths("items/q1.xml", "img", "src", formatUrl(kept)),
          [file],
          value,
        );
      }
    }
  });
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
  it("names each file a URL attribute's package paths name, a srcset's in order, and none for any other value", () => {
    const cases = [
      ["img", "src", "media/a%20b.png", ["items/media/a b.png"]],
      ["object", "data", "media/graph.svg#v", ["items/media/graph.svg"]],
      ["video", "poster", "./poster.png", ["items/poster.png"]],
      ["a", "href", "passage.html", ["items/passage.html"]],
      [
        "source",
        "srcset",
        "a.png 1x, b.png 2x, c.png 3x",
        ["items/a.png", "items/b.png", "items/c.png"],
      ],
      ["source", "srcset", "a.png 1x, https://r.example/b.png 2x, c.png 3x", []],
      ["img", "src", "../shared/a.png", ["shared/a.png"]],
      ["img", "src", "../../shared/a.png", []],
      ["source", "srcset", "a.png 1x, ../../b.png 2x", []],
      ["img", "src", "/a.png", []],
      ["img", "src", "https://r.example/a.png", []],
      ["object", "data", "https://r.example/a.svg", []],
      ["a", "href", "#q1", []],
      ["img", "src", "javascript:alert(1)", []],
      ["img", "src", " ", []],
      ["img", "alt", "a.png", []],
      ["p", "src", "a.png", []],
    ] as const;
    for (const [element, attribute, value, files] of cases) {
      assert.deepStrictEqual(
        assetPaths("items/q1.xml", element, attribute, value),
        files,
        `${element}@${attribute}="${value}"`,
      );
    }
  });
});

describe("a PCI's module locations", () => {
  it("are paths from the package root for an item in a subfolder, by reading 201", () => {
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
  } = /^(?:(?<scheme>[^#/:?]+):)?(?:\/\/(?<authority>[^#/?]*))?(?<path>[^#?]*)(?:\?(?<query>[^#]*))?(?:#(?<fragment>.*))?/u.exec(
    reference,
  )?.groups ?? {};

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
 * Give the file a relative reference in an item names, by RFC 3986: the reference's
 * percent-encoded unreserved characters normalized first (section 6.2.2.2, so `%2e` is a `.`),
 * resolved against the item's URI under {@link oracleRoot}, then each segment percent-decoded
 * (section 2.1). Reading 102 states each step for pantry and plate alike: a path that climbs above
 * the package root resolves outside it, and names no file of it.
 *
 * @param location The item's path from the package root.
 * @param reference The reference, a relative path with no query or fragment.
 * @returns The file's path from the package root, or none when it leaves the package.
 */
const fileByRfc3986 = (location: string, reference: string): readonly string[] => {
  const unreserved = reference.replaceAll(/%(?<hex>[\dA-Fa-f]{2})/gu, (escape, hex: string) => {
    const character = String.fromCodePoint(Number.parseInt(hex, 16));

    return /^[\w.~-]$/u.test(character) ? character : escape;
  });
  const target = resolveReference(`${oracleRoot}${location}`, unreserved);

  return target.startsWith(oracleRoot)
    ? [target.slice(oracleRoot.length).split("/").map(decodeURIComponent).join("/")]
    : [];
};

describe("resolution against the item's location, by RFC 3986", () => {
  it("names, for every path of up to four segments in items at four depths, the file RFC 3986 resolves it to", () => {
    // The names include the item's own folders and short names a resolver could mistake for its
    // own, so a climb back into the folder it left is told apart from a path that never left.
    const segments = [".", "..", "%2e%2E", "a", "b", "root", "items", "c%20d.png"];
    const locations = ["q1.xml", "items/q1.xml", "items/deep/q1.xml", "a/b/q1.xml"];
    let paths: readonly string[] = [""];
    const references: string[] = [];
    for (let length = 1; length <= 4; length += 1) {
      paths = paths.flatMap((path) =>
        segments.map((segment) => (path === "" ? segment : `${path}/${segment}`)),
      );
      references.push(...paths, ...paths.map((path) => `/${path}`));
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
const replacedSpace = (value: string): string => value.replaceAll(/[\t\n\r]/gu, " ");

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
    // database refuses it under "Href form" (pantry's spec reading 102), so plate never meets one.
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
