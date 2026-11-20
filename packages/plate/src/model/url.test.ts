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
 * A kept remote URL.
 */
type RemoteUrl = Extract<KeptUrl, { readonly kind: "remote" }>;

/**
 * A dropped value.
 */
type DroppedUrl = Extract<ClassifiedUrl, { readonly kind: "dropped" }>;

/**
 * One image candidate of a kept `srcset`.
 */
type SrcsetCandidate = Extract<KeptUrl, { readonly kind: "srcset" }>["candidates"][number];

/**
 * The feature key of a URL that resolves outside the package.
 */
const outsidePackageFeature = "url-outside-package";

/**
 * The feature key of a value the URL parser refuses, or a blank one.
 */
const invalidUrlFeature = "url-invalid";

/**
 * Construct the feature key of a URL dropped for its scheme.
 *
 * @param scheme The scheme, lower case, without its colon.
 * @returns `url-scheme:<scheme>`.
 */
const schemeFeature = (scheme: string): string => `url-scheme:${scheme}`;

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
 * Construct a kept remote URL for a test.
 *
 * @param href Its parsed href.
 * @returns The classification.
 */
const remote = (href: string): RemoteUrl => ({ href, kind: "remote" });

/**
 * Construct a dropped URL for a test.
 *
 * @param feature The feature key it is dropped with.
 * @returns The classification.
 */
const dropped = (feature: string): DroppedUrl => ({ feature, kind: "dropped" });

/**
 * Construct a kept `srcset` for a test.
 *
 * @param candidates Its image candidates, in order.
 * @returns The classification.
 */
const srcset = (...candidates: readonly SrcsetCandidate[]): ClassifiedUrl => ({
  candidates,
  kind: "srcset",
});

/**
 * Construct one `srcset` image candidate for a test.
 *
 * @param url The candidate's kept URL.
 * @param descriptors Its descriptors, in order.
 * @returns The candidate.
 */
const candidate = (url: PackageUrl | RemoteUrl, ...descriptors: readonly string[]) => ({
  descriptors,
  url,
});

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

  it("reads an element by its namespace and an attribute by its own, never by a local name alone", () => {
    const svg = "http://www.w3.org/2000/svg";
    const xlink = "http://www.w3.org/1999/xlink";

    assert.deepStrictEqual(urlContextOf(name(svg, "a"), name("", "href")), Option.none());
    assert.deepStrictEqual(
      urlContextOf(name(qtiNamespace, "a"), name(xlink, "href")),
      Option.none(),
    );
    assert.deepStrictEqual(urlContextOf(name(qtiNamespace, "mi"), name("", "href")), Option.none());
  });
});

describe("classifyUrl", () => {
  for (const value of [
    " javascript:alert(1)",
    "java\tscript:alert(1)",
    "java\nscript:alert(1)",
    "JAVASCRIPT:alert(1)",
    "\u0001javascript:alert(1)",
  ]) {
    it(`drops ${JSON.stringify(value)} as url-scheme:javascript in every context`, () => {
      for (const context of singleContexts) {
        assert.deepStrictEqual(
          classifyUrl(context, value),
          dropped("url-scheme:javascript"),
          context,
        );
      }
    });
  }

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

  it("reads https:evil.com/x as the package path evil.com/x, never the remote https://evil.com/x", () => {
    for (const context of singleContexts) {
      assert.deepStrictEqual(
        classifyUrl(context, "https:evil.com/x"),
        inPackage("evil.com/x"),
        context,
      );
    }
  });

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

  it("keeps a package path in its parsed form, with its query and fragment", () => {
    assert.deepStrictEqual(
      classifyUrl("resource", "images/a b.png"),
      inPackage("images/a%20b.png"),
    );
    assert.deepStrictEqual(
      classifyUrl("link", "  shared/page.html?x=1#part "),
      inPackage("shared/page.html?x=1#part"),
    );
    assert.deepStrictEqual(
      classifyUrl("resource", "images/./a/../b.png"),
      inPackage("images/b.png"),
    );
  });

  it("keeps http and https as their parsed href in the link and resource contexts", () => {
    for (const context of ["link", "resource"] as const) {
      assert.deepStrictEqual(
        classifyUrl(context, "http://example.com/a b.png"),
        remote("http://example.com/a%20b.png"),
        context,
      );
      assert.deepStrictEqual(
        classifyUrl(context, "HTTPS://Example.COM/x"),
        remote("https://example.com/x"),
        context,
      );
      assert.deepStrictEqual(
        classifyUrl(context, "http:evil.com/x"),
        remote("http://evil.com/x"),
        context,
      );
    }
  });

  it("drops mailto:, tel:, data: and every other scheme, by its scheme", () => {
    const cases = [
      ["mailto:a@example.com", "mailto"],
      ["tel:+15550100", "tel"],
      ["data:image/png;base64,AA==", "data"],
      ["vbscript:x", "vbscript"],
      ["blob:https://example.com/x", "blob"],
      ["file:///etc/passwd", "file"],
    ] as const;
    for (const [value, scheme] of cases) {
      for (const context of singleContexts) {
        assert.deepStrictEqual(
          classifyUrl(context, value),
          dropped(schemeFeature(scheme)),
          `${value} in ${context}`,
        );
      }
    }
  });

  it("keeps #q1 as a same-document fragment in the link context", () => {
    assert.deepStrictEqual(classifyUrl("link", "#q1"), { fragment: "q1", kind: "fragment" });
    assert.deepStrictEqual(classifyUrl("link", " #q1"), { fragment: "q1", kind: "fragment" });
    assert.deepStrictEqual(classifyUrl("link", "#"), { fragment: "", kind: "fragment" });
  });

  it("reads a fragment outside the link context, and ./#q1 in it, as a package path", () => {
    assert.deepStrictEqual(classifyUrl("resource", "#q1"), inPackage("./#q1"));
    assert.deepStrictEqual(classifyUrl("link", "./#q1"), inPackage("./#q1"));
  });

  it("writes a package path that would read as a scheme or a host with a leading ./", () => {
    assert.deepStrictEqual(classifyUrl("link", "./javascript:x"), inPackage("./javascript:x"));
    assert.deepStrictEqual(
      classifyUrl("link", "./https:evil.com/x"),
      inPackage("./https:evil.com/x"),
    );
    assert.deepStrictEqual(classifyUrl("resource", ".///evil.com/x"), inPackage(".///evil.com/x"));
  });

  it("keeps a package object@data and drops a remote one as url-outside-package", () => {
    assert.deepStrictEqual(
      classifyUrl("embed", "shared/orkney.html"),
      inPackage("shared/orkney.html"),
    );
    assert.deepStrictEqual(
      classifyUrl("embed", "images/rectangle.svg"),
      inPackage("images/rectangle.svg"),
    );
    assert.deepStrictEqual(
      classifyUrl("embed", "https://example.com/page.html"),
      dropped(outsidePackageFeature),
    );
    assert.deepStrictEqual(
      classifyUrl("embed", "http://example.com/page.html"),
      dropped(outsidePackageFeature),
    );
  });

  it("drops an empty or whitespace-only value as url-invalid in every context", () => {
    for (const value of ["", " ", " \t\n\r "]) {
      for (const context of ["link", "resource", "embed", "srcset"] as const) {
        assert.deepStrictEqual(
          classifyUrl(context, value),
          dropped(invalidUrlFeature),
          `${JSON.stringify(value)} in ${context}`,
        );
      }
    }
  });

  it("drops a value of control characters, which the parser strips to nothing, as url-invalid", () => {
    for (const context of singleContexts) {
      assert.deepStrictEqual(
        classifyUrl(context, "\u0001 \u001F"),
        dropped(invalidUrlFeature),
        context,
      );
    }
  });

  it("keeps a reference to the item's directory itself as the package path ./", () => {
    for (const value of [".", "./", "?", "images/..", "https:"]) {
      for (const context of singleContexts) {
        assert.deepStrictEqual(
          classifyUrl(context, value),
          inPackage("./"),
          `${JSON.stringify(value)} in ${context}`,
        );
      }
    }
  });

  it("drops a value the URL parser refuses as url-invalid", () => {
    for (const context of singleContexts) {
      assert.deepStrictEqual(classifyUrl(context, "http://["), dropped(invalidUrlFeature), context);
      assert.deepStrictEqual(classifyUrl(context, "https://"), dropped(invalidUrlFeature), context);
    }
  });

  it("reads its own written form back as the same classification", () => {
    const values = [
      "images/a b.png",
      "https:evil.com/x",
      "./javascript:x",
      ".///evil.com/x",
      "./#q1",
      "#q1",
      "x?",
      "",
      ".",
      "./",
      "?",
      "HTTPS://Example.COM/x",
      "a.png 1x, https://example.com/b.png 2x",
      "../x",
      "../../a b.png?v#t",
      "../javascript:x",
      "..",
      "../.. 1x, ../a/../b.png 2x",
    ];
    for (const context of ["link", "resource", "embed", "srcset"] as const) {
      for (const value of values) {
        const first = classifyUrl(context, value);
        if (first.kind !== "dropped") {
          assert.deepStrictEqual(
            classifyUrl(context, formatUrl(first)),
            first,
            `${JSON.stringify(value)} in ${context}`,
          );
        }
      }
    }
  });
});

describe("classifyUrl, srcset", () => {
  it("keeps the corpus item nested_object's srcset values as package paths", () => {
    assert.deepStrictEqual(
      classifyUrl("srcset", "images/postcard.webp"),
      srcset(candidate(inPackage("images/postcard.webp"))),
    );
    assert.deepStrictEqual(
      classifyUrl("srcset", "images/postcard.svg"),
      srcset(candidate(inPackage("images/postcard.svg"))),
    );
  });

  it("keeps each candidate's URL in its parsed form with its descriptors", () => {
    assert.deepStrictEqual(
      classifyUrl("srcset", "small.png 1x,\n large.png 2x, https://Example.com/w.png 480w"),
      srcset(
        candidate(inPackage("small.png"), "1x"),
        candidate(inPackage("large.png"), "2x"),
        candidate(remote("https://example.com/w.png"), "480w"),
      ),
    );
  });

  it("drops the whole attribute when one candidate is refused", () => {
    assert.deepStrictEqual(
      classifyUrl("srcset", "https://example.com/a.png 1x, javascript:alert(1) 2x"),
      dropped("url-scheme:javascript"),
    );
    assert.deepStrictEqual(
      classifyUrl("srcset", "a.png 1x, //host/b.png 2x"),
      dropped(outsidePackageFeature),
    );
  });

  it("classifies a candidate the browser skips for its descriptors, and leaves it out of the parsed form", () => {
    assert.deepStrictEqual(
      classifyUrl("srcset", "a.png 1x, b.png 0w"),
      srcset(candidate(inPackage("a.png"), "1x")),
    );
    assert.deepStrictEqual(
      classifyUrl("srcset", "a.png 1x, javascript:x 0w"),
      dropped("url-scheme:javascript"),
    );
  });

  it("splits candidates as the HTML srcset parser does", () => {
    assert.deepStrictEqual(
      classifyUrl("srcset", "a.png,, b.png 2x"),
      srcset(candidate(inPackage("a.png")), candidate(inPackage("b.png"), "2x")),
    );
    assert.deepStrictEqual(
      classifyUrl("srcset", "a.png 1x, b.png (1x, javascript:alert(1) 2x)"),
      srcset(candidate(inPackage("a.png"), "1x")),
      "a parenthesised descriptor holds its comma, so the browser reads no third URL",
    );
  });

  it("drops a srcset a browser reads no candidate from as url-invalid, since it is written empty", () => {
    for (const value of [
      ",",
      "a.png 100h",
      "images/a b.png",
      "a.png (1x, javascript:alert(1) 2x)",
    ]) {
      assert.deepStrictEqual(classifyUrl("srcset", value), dropped(invalidUrlFeature), value);
    }
  });

  it("drops a srcset whose candidate URL would not split back as the same URL as url-invalid", () => {
    assert.deepStrictEqual(classifyUrl("srcset", "a.png,\u0001 2x"), dropped(invalidUrlFeature));
    assert.deepStrictEqual(classifyUrl("srcset", "\u0001 1x"), dropped(invalidUrlFeature));
  });
});

describe("formatUrl", () => {
  it("writes a kept value in its parsed form, a package path as its path below the item's directory", () => {
    assert.strictEqual(formatUrl(inPackage("images/a%20b.png")), "images/a%20b.png");
    assert.strictEqual(formatUrl(inPackage("./@evil.com/x")), "./@evil.com/x");
    assert.strictEqual(formatUrl(remote("https://example.com/x")), "https://example.com/x");
    assert.strictEqual(formatUrl({ fragment: "q1", kind: "fragment" }), "#q1");
  });

  it("writes a srcset candidate by candidate, each followed by its descriptors", () => {
    const kept = classifyUrl("srcset", "small.png 1x, https://example.com/large.png 2x");
    assert.strictEqual(kept.kind, "srcset");
    if (kept.kind === "srcset") {
      assert.strictEqual(formatUrl(kept), "small.png 1x, https://example.com/large.png 2x");
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
  /**
   * The addresses the cases write, by file.
   */
  const assets = assetsOf([
    ["items/media/a b.png", "https://cdn.example/sha256/1"],
    ["items/@evil.com/x", "https://cdn.example/sha256/2"],
    ["items/small.png", "https://cdn.example/sha256/3"],
    ["items/asl/item123.mp4", "https://cdn.example/sha256/4"],
  ]);

  it("writes a package path as its file's address, then its query and fragment, never on the page's base", () => {
    assert.deepStrictEqual(
      addressUrl(inPackage("media/a%20b.png"), "items/q1.xml", assets),
      Result.succeed("https://cdn.example/sha256/1"),
    );
    assert.deepStrictEqual(
      addressUrl(inPackage("asl/item123.mp4#t=00:00:01,00:00:10.0"), "items/q1.xml", assets),
      Result.succeed("https://cdn.example/sha256/4#t=00:00:01,00:00:10.0"),
    );
    assert.deepStrictEqual(
      addressUrl(inPackage("./@evil.com/x"), "items/q1.xml", assets),
      Result.succeed("https://cdn.example/sha256/2"),
    );
  });

  it("writes a path that climbs above the item's directory as the address of the file it names", () => {
    const beside = assetsOf([["images/a.png", "https://cdn.example/sha256/6"]]);
    assert.deepStrictEqual(
      addressUrl(inPackage("../images/a.png#x"), "items/q1.xml", beside),
      Result.succeed("https://cdn.example/sha256/6#x"),
    );
    assert.deepStrictEqual(
      addressUrl(inPackage("../../images/a.png"), "items/q1.xml", beside),
      Result.fail("items/../../images/a.png"),
    );
  });

  it("fails with the file's path when assets give the file no address, whatever the page could resolve", () => {
    assert.deepStrictEqual(
      addressUrl(inPackage("media/c.png"), "items/q1.xml", assets),
      Result.fail("items/media/c.png"),
    );
    assert.deepStrictEqual(
      addressUrl(inPackage("a%20b.png"), "items/media/q1.xml", new Map()),
      Result.fail("items/media/a b.png"),
    );
  });

  it("fails for a location whose path is no PackagePath, since no key of assets can be one", () => {
    const beside = assetsOf([["items/a.png", "https://cdn.example/sha256/5"]]);
    assert.deepStrictEqual(
      addressUrl(inPackage("a.png"), "items/q1.xml", beside),
      Result.succeed("https://cdn.example/sha256/5"),
    );
    assert.deepStrictEqual(
      addressUrl(inPackage("a.png"), "/items/q1.xml", beside),
      Result.fail("/items/a.png"),
    );
    assert.deepStrictEqual(
      addressUrl(inPackage("a.png"), "../items/q1.xml", beside),
      Result.fail("../items/a.png"),
    );
  });

  it("writes a remote URL and a fragment as parsed, and needs no address for either", () => {
    assert.deepStrictEqual(
      addressUrl(remote("https://example.com/x"), "items/q1.xml", new Map()),
      Result.succeed("https://example.com/x"),
    );
    assert.deepStrictEqual(
      addressUrl({ fragment: "q1", kind: "fragment" }, "items/q1.xml", new Map()),
      Result.succeed("#q1"),
    );
  });

  it("writes a srcset candidate by candidate, each package path as its address, and fails at its first file with no address", () => {
    const kept = classifyUrl("srcset", "small.png 1x, https://example.com/large.png 2x");
    const missing = classifyUrl("srcset", "small.png 1x, medium.png 2x, large.png 3x");
    assert.strictEqual(kept.kind, "srcset");
    assert.strictEqual(missing.kind, "srcset");
    if (kept.kind === "srcset" && missing.kind === "srcset") {
      assert.deepStrictEqual(
        addressUrl(kept, "items/q1.xml", assets),
        Result.succeed("https://cdn.example/sha256/3 1x, https://example.com/large.png 2x"),
      );
      assert.deepStrictEqual(
        addressUrl(missing, "items/q1.xml", assets),
        Result.fail("items/medium.png"),
      );
    }
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
        "a.png 1x, https://r.example/b.png 2x, c.png 3x",
        ["items/a.png", "items/c.png"],
      ],
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

describe("classifyUrlAt", () => {
  it("keeps a path that climbs above the item's directory and stays in the package", () => {
    assert.deepStrictEqual(
      classifyUrlAt("items/q1.xml", "resource", "../images/a.png"),
      inPackage("../images/a.png"),
    );
    assert.deepStrictEqual(
      classifyUrlAt("items/deep/q1.xml", "srcset", "../../a.png 1x, ../b.png 2x"),
      srcset(candidate(inPackage("../../a.png"), "1x"), candidate(inPackage("../b.png"), "2x")),
    );
  });

  it("drops a path that climbs above the package root as url-outside-package, a srcset whole", () => {
    assert.deepStrictEqual(
      classifyUrlAt("q1.xml", "resource", "../images/a.png"),
      dropped(outsidePackageFeature),
    );
    assert.deepStrictEqual(
      classifyUrlAt("items/q1.xml", "srcset", "a.png 1x, ../../b.png 2x"),
      dropped(outsidePackageFeature),
    );
  });

  it("classifies a value with no package path as classifyUrl does", () => {
    for (const value of ["https://example.com/x", "#q1", "mailto:a@example.com", "/x", ""]) {
      assert.deepStrictEqual(
        classifyUrlAt("q1.xml", "link", value),
        classifyUrl("link", value),
        value,
      );
    }
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
  it("transcribes RFC 3986's resolver: every example of section 5.4 resolves as the RFC states", () => {
    const base = "http://a/b/c/d;p?q";
    const examples = [
      ["g:h", "g:h"],
      ["g", "http://a/b/c/g"],
      ["./g", "http://a/b/c/g"],
      ["g/", "http://a/b/c/g/"],
      ["/g", "http://a/g"],
      ["//g", "http://g"],
      ["?y", "http://a/b/c/d;p?y"],
      ["g?y", "http://a/b/c/g?y"],
      ["#s", "http://a/b/c/d;p?q#s"],
      ["g#s", "http://a/b/c/g#s"],
      ["g?y#s", "http://a/b/c/g?y#s"],
      [";x", "http://a/b/c/;x"],
      ["g;x", "http://a/b/c/g;x"],
      ["g;x?y#s", "http://a/b/c/g;x?y#s"],
      ["", "http://a/b/c/d;p?q"],
      [".", "http://a/b/c/"],
      ["./", "http://a/b/c/"],
      ["..", "http://a/b/"],
      ["../", "http://a/b/"],
      ["../g", "http://a/b/g"],
      ["../..", "http://a/"],
      ["../../", "http://a/"],
      ["../../g", "http://a/g"],
      ["../../../g", "http://a/g"],
      ["../../../../g", "http://a/g"],
      ["/./g", "http://a/g"],
      ["/../g", "http://a/g"],
      ["g.", "http://a/b/c/g."],
      [".g", "http://a/b/c/.g"],
      ["g..", "http://a/b/c/g.."],
      ["..g", "http://a/b/c/..g"],
      ["./../g", "http://a/b/g"],
      ["./g/.", "http://a/b/c/g/"],
      ["g/./h", "http://a/b/c/g/h"],
      ["g/../h", "http://a/b/c/h"],
      ["g;x=1/./y", "http://a/b/c/g;x=1/y"],
      ["g;x=1/../y", "http://a/b/c/y"],
      ["g?y/./x", "http://a/b/c/g?y/./x"],
      ["g?y/../x", "http://a/b/c/g?y/../x"],
      ["g#s/./x", "http://a/b/c/g#s/./x"],
      ["g#s/../x", "http://a/b/c/g#s/../x"],
      ["http:g", "http:g"],
    ] as const;
    for (const [reference, target] of examples) {
      assert.strictEqual(resolveReference(base, reference), target, reference);
    }
  });

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
