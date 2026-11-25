/**
 * The module facts a host resolves a Portable Custom Interaction's modules from (Q-16): each PCI's
 * response identifier and its `module` and `qti-interaction-modules` as written, which
 * `resolvePciModules` turns into the routes the host serves.
 *
 * The oracle is the fixture package `fixtures/pci/package/`, read by eye: `counter.xml` binds its
 * one PCI to `RESPONSE`, names `module="counter"`, and lists one `qti-interaction-module` with
 * `id="counter"` and `primary-path="modules/counter"` under `primary-configuration=
 * "modules/module_resolution.js"`, which writes `waitSeconds` 30; the manifest lists that file and
 * `modules/counter.js`; the package holds no secondary configuration. So, by the implementation
 * guide's rules as `#plate/pci/resolve.ts` states them, the module loads from its own
 * `primary-path` with `.js` appended (R1), waits 30 seconds (the primary configuration's) and 7 for
 * a fallback it has none of (R3, R4), and nothing is unlisted. `items/pci.xml` names its module by
 * `module="counter"` alone, so its facts hold no listed module and no configuration.
 *
 * @module
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option } from "effect";
import { assetPaths } from "#plate/model/url.ts";
import { pciModulesIn } from "#plate/pci/modules.ts";
import { resolvePciModules } from "#plate/pci/resolve.ts";
import { boxHolds } from "#plate/test/box.ts";
import { fixturesDirectory } from "#plate/test/scratch.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";

/**
 * The fixture package's folder.
 */
const packageDirectory = path.join(fixturesDirectory, "pci", "package");

/**
 * The files `fixtures/pci/package/imsmanifest.xml` lists.
 */
const listed: ReadonlySet<string> = new Set([
  "counter.xml",
  "modules/counter.js",
  "modules/module_resolution.js",
]);

/**
 * Open a fixture item and take it accepted.
 *
 * @param file The item's path under `fixtures/pci/`.
 * @returns The accepted item.
 */
const accept = (file: string) =>
  Effect.map(admitted(file, readFileSync(path.join(fixturesDirectory, "pci", file))), (verdict) =>
    Option.getOrElse(acceptedItem(verdict), () =>
      assert.fail(`${file} is not accepted: ${verdict.verdict}`),
    ),
  );

/**
 * Read a file of the fixture package as text.
 *
 * @param file Its path from the package root.
 * @returns Its text, none when the package holds no such file.
 */
const packageFile = (file: string): Option.Option<string> =>
  existsSync(path.join(packageDirectory, file))
    ? Option.some(readFileSync(path.join(packageDirectory, file), "utf-8"))
    : Option.none();

/**
 * The starts a location of the location box takes: none, `./`, `../`, which climbs above the
 * package root, and an absolute URL's, which R5 drops.
 */
const STARTS = ["", "./", "../", "https://cdn.example.org/"] as const;

/**
 * The folders a location of the location box passes through: a name, another, both dot segments
 * and `..` percent-encoded.
 */
const FOLDERS = ["modules", "b", ".", "..", "%2E%2E"] as const;

/**
 * The last segments a location of the location box ends in: a name without `.js`, with it, with
 * it in another case, with its point percent-encoded, and the three dot segments.
 */
const LAST_SEGMENTS = ["a", "a.js", "a.JS", "a%2Ejs", ".", "..", "%2E%2E"] as const;

/**
 * The fields of a module a location of the location box is written in.
 */
const OWNS = ["primaryPath", "fallbackPath"] as const;

/**
 * A case of the location box: a location and the field it is written in.
 */
interface LocationCase {
  readonly own: (typeof OWNS)[number];
  readonly written: string;
}

/**
 * Draw a case of the location box: a start, up to two folders, a last segment, a query or none
 * and a fragment or none, as a primary or a fallback path.
 */
const locationCase: Gen<LocationCase> = (source) => {
  const start = source.draw(element(STARTS));
  const folders = source.draw(array(element(FOLDERS), { max: 2, min: 0 }));
  const last = source.draw(element(LAST_SEGMENTS));
  const query = source.draw(element(["", "?v=1"] as const));
  const fragment = source.draw(element(["", "#v1"] as const));

  return {
    own: source.draw(element(OWNS)),
    written: `${start}${folders.map((folder) => `${folder}/`).join("")}${last}${query}${fragment}`,
  };
};

/**
 * How many cases {@link locationCase} draws.
 */
const LOCATION_CASES = 4 * (1 + 5 + 5 ** 2) * 7 * 2 * 2 * 2;

/**
 * What a location of the location box reaches that a resolver could misroute.
 */
const locationSituations = [
  ".js appended",
  "ending in .js",
  "a folder's .js",
  "a query or a fragment",
  "climbing above the root",
  "an absolute URL",
] as const;

/**
 * A {@link locationSituations} member.
 */
type LocationSituation = (typeof locationSituations)[number];

/**
 * Whether a character may continue a URI scheme (RFC 3986 section 3.1): a letter, a digit, `+`,
 * `-` or `.`.
 *
 * @param character One character.
 * @returns Whether it may.
 */
const continuesScheme = (character: string): boolean =>
  (character >= "a" && character <= "z") ||
  (character >= "A" && character <= "Z") ||
  (character >= "0" && character <= "9") ||
  character === "+" ||
  character === "-" ||
  character === ".";

/**
 * Whether a reference is an absolute URL: it starts with a scheme, a letter then letters, digits,
 * `+`, `-` or `.`, and a colon (RFC 3986 section 3.1), before any `/`, `?` or `#`.
 *
 * @param reference The reference.
 * @returns Whether it has a scheme.
 */
const hasScheme = (reference: string): boolean => {
  const colon = reference.indexOf(":");
  const scheme = reference.slice(0, Math.max(colon, 0));
  const first = scheme.charAt(0);

  return (
    colon > 0 &&
    ((first >= "a" && first <= "z") || (first >= "A" && first <= "Z")) &&
    Array.from(scheme).every(continuesScheme)
  );
};

/**
 * A path's segments with their dot segments removed from the package root, as RFC 3986 section
 * 5.2.4 removes them, but that a `..` above the root climbs out of the package.
 *
 * @param decoded A decoded path, from the package root.
 * @returns The path, none when it climbs above the root.
 */
const fromRoot = (decoded: string): Option.Option<string> =>
  Option.map(
    Arr.reduce(
      decoded.split("/"),
      Option.some<readonly string[]>([]),
      (kept: Option.Option<readonly string[]>, segment) =>
        Option.flatMap(kept, (segments) => {
          if (segment === "." || segment === "") {
            return Option.some(segments);
          }

          if (segment === "..") {
            return Arr.isReadonlyArrayNonEmpty(segments)
              ? Option.some(segments.slice(0, -1))
              : Option.none();
          }

          return Option.some([...segments, segment]);
        }),
    ),
    (segments) => segments.join("/"),
  );

/**
 * Where reading `pci-module-locations` routes a module location, and the file the package serves it
 * from: none for an absolute URL (R5). Otherwise the location's query (from its first `?`) and
 * fragment (from its first `#`) are kept apart, as reading `href-resolution` reads an href, and
 * `.js` goes after its path unless the file the path names already ends in `.js`, a name being
 * case-sensitive, so `a.JS` does not: the path percent-decoded as the package names its files (RFC
 * 3986 section 2.1, so `%2E` is `.`) from the package root, or, for a path that names no file of
 * the package, climbing above the root, the path as written (R1). A path whose last segment is a
 * dot segment names a folder (RFC 3986 section 5.2.4), whose file `.js` is, as the database appends
 * `.js` to the resolved path (pantry's `moduleFileOf`). The routed location writes the path as it
 * was written, its `.js` and its query and fragment after it; its file is the decoded path from the
 * package root, none when it climbs above the root (reading `href-resolution`).
 *
 * @param written The location as written.
 * @returns The routed location, its files and the situations it reaches.
 */
const expectedRoute = (
  written: string,
): {
  readonly files: readonly string[];
  readonly routed: Option.Option<string>;
  readonly situations: readonly LocationSituation[];
} => {
  if (hasScheme(written)) {
    return { files: [], routed: Option.none(), situations: ["an absolute URL"] };
  }

  const hash = written.indexOf("#");
  const beforeFragment = hash === -1 ? written : written.slice(0, hash);
  const mark = beforeFragment.indexOf("?");
  const writtenPath = mark === -1 ? beforeFragment : beforeFragment.slice(0, mark);
  const after = written.slice(writtenPath.length);
  const decoded = decodeURIComponent(writtenPath);
  const lastDecoded = decoded.slice(decoded.lastIndexOf("/") + 1);
  const isFolder = lastDecoded === "." || lastDecoded === "..";
  const named = Option.getOrElse(fromRoot(decoded), () => writtenPath);
  const endsInJs = !isFolder && named.endsWith(".js");
  const routedPath = isFolder ? `${writtenPath}/.js` : endsInJs ? writtenPath : `${writtenPath}.js`;
  const file = fromRoot(decodeURIComponent(routedPath));
  const situations: readonly (readonly [LocationSituation, boolean])[] = [
    [".js appended", !isFolder && !endsInJs],
    ["ending in .js", endsInJs],
    ["a folder's .js", isFolder],
    ["a query or a fragment", after !== ""],
    ["climbing above the root", Option.isNone(file)],
  ];

  return {
    files: Option.toArray(file),
    routed: Option.some(`${routedPath}${after}`),
    situations: situations.flatMap(([situation, held]) => (held ? [situation] : [])),
  };
};

describe("the module facts of an item's Portable Custom Interactions", () => {
  it.effect(
    "give the package item's PCI with its module and listed module, which resolve to its own primary path, the configuration's wait and no fallback",
    () =>
      Effect.gen(function* packageItem() {
        const facts = pciModulesIn(yield* accept("package/counter.xml"));

        assert.deepStrictEqual(facts, [
          {
            modules: {
              module: Option.some("counter"),
              modules: [
                {
                  fallbackPath: Option.none(),
                  id: "counter",
                  primaryPath: Option.some("modules/counter"),
                },
              ],
              primaryConfiguration: "modules/module_resolution.js",
              secondaryConfiguration: "modules/fallback_module_resolution.js",
            },
            response: "RESPONSE",
          },
        ]);

        const [counter] = facts;

        assert.deepStrictEqual(
          counter === undefined
            ? undefined
            : resolvePciModules(counter.modules, packageFile, (file) => listed.has(file)),
          {
            entry: Option.some("counter"),
            notices: [],
            routes: [
              {
                fallback: Option.none(),
                id: "counter",
                primary: Option.some("modules/counter.js"),
                waitSeconds: { fallback: 7, primary: 30 },
              },
            ],
          },
        );
      }),
  );

  it.effect(
    "give a PCI that names its module by the module attribute alone with no listed module and no configuration",
    () =>
      Effect.gen(function* moduleAttribute() {
        assert.deepStrictEqual(pciModulesIn(yield* accept("items/pci.xml")), [
          {
            modules: {
              module: Option.some("counter"),
              modules: [],
              primaryConfiguration: "modules/module_resolution.js",
              secondaryConfiguration: "modules/fallback_module_resolution.js",
            },
            response: "RESPONSE",
          },
        ]);
      }),
  );

  it("route a module from its own locations alone, its configurations giving its waits and never a location", () => {
    // Oracle: reading `pci-configuration-waits` (docs/spec-readings.md), written by hand: a configuration gives its
    // loads' waits, the primary configuration's to primary loads and the secondary's to fallback
    // loads, 0 meaning no timeout, and never a location, so `paths` routes nothing, a module named
    // by `module` alone has no location (R4), and a configuration that writes no `paths` is valid.
    // Bound: one PCI whose entry has a fallback alone, a module the primary configuration maps
    // elsewhere, and a module named only in the configurations.
    const files = new Map([
      [
        "modules/module_resolution.js",
        JSON.stringify({ paths: { a: "modules/b", c: "modules/c" }, waitSeconds: 30 }),
      ],
      ["modules/fallback_module_resolution.js", JSON.stringify({ waitSeconds: 0 })],
    ]);
    const resolution = resolvePciModules(
      {
        module: Option.some("a"),
        modules: [{ fallbackPath: Option.some("modules/a"), id: "a", primaryPath: Option.none() }],
        primaryConfiguration: "modules/module_resolution.js",
        secondaryConfiguration: "modules/fallback_module_resolution.js",
      },
      (file) => Option.fromUndefinedOr(files.get(file)),
      () => true,
    );

    assert.deepStrictEqual(resolution, {
      entry: Option.some("a"),
      notices: [],
      routes: [
        {
          fallback: Option.some("modules/a.js"),
          id: "a",
          primary: Option.none(),
          waitSeconds: { fallback: 0, primary: 30 },
        },
      ],
    });
    assert.deepStrictEqual(
      resolvePciModules(
        {
          module: Option.some("c"),
          modules: [],
          primaryConfiguration: "modules/module_resolution.js",
          secondaryConfiguration: "modules/fallback_module_resolution.js",
        },
        (file) => Option.fromUndefinedOr(files.get(file)),
        () => true,
      ),
      {
        entry: Option.some("c"),
        notices: [{ id: "c", kind: "pci-module-unresolved" }],
        routes: [
          {
            fallback: Option.none(),
            id: "c",
            primary: Option.none(),
            waitSeconds: { fallback: 0, primary: 30 },
          },
        ],
      },
    );
  });

  it.effect(
    `route each module location to the file reading \`pci-module-locations\` names, its query and fragment kept apart, its path decoded, over every location of the location box as a primary and as a fallback path: ${String(LOCATION_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(locationCase, LOCATION_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "every location of a start (none, ./, ../ or an absolute URL's), up to two folders of modules, b, ., .. and %2E%2E, a last segment of a, a.js, a.JS, a%2Ejs, ., .. or %2E%2E, with and without a query and a fragment, as a primary and as a fallback path",
              caseHang: Duration.seconds(30),
              coverage: requiredInSpace<LocationSituation>(locationSituations),
              generator: locationCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "reading `pci-module-locations`, transcribed here: a location names its path with .js appended unless its decoded path already ends in .js (case-sensitively) or its last segment is a dot segment, which names a folder whose file .js is; its query and fragment are kept apart, as reading `href-resolution` reads an href; its path is percent-decoded (RFC 3986 section 2.1) and its dot segments removed (section 5.2.4) from the package root, a path climbing above it naming no file (reading `href-resolution`); and an absolute URL is dropped (R5)",
              },
              suite: "plate/pci-modules/locations",
            },
            ({ own, written }, c) =>
              Effect.sync(() => {
                const expected = expectedRoute(written);
                c.noteAll(expected.situations);

                const { routes } = resolvePciModules(
                  {
                    module: Option.some("a"),
                    modules: [
                      {
                        fallbackPath: own === "fallbackPath" ? Option.some(written) : Option.none(),
                        id: "a",
                        primaryPath: own === "primaryPath" ? Option.some(written) : Option.none(),
                      },
                    ],
                    primaryConfiguration: "modules/module_resolution.js",
                    secondaryConfiguration: "modules/fallback_module_resolution.js",
                  },
                  () => Option.none(),
                  () => true,
                );
                const [route] = routes;
                const location = own === "primaryPath" ? route?.primary : route?.fallback;

                assert.deepStrictEqual(location, expected.routed, `${written} as a ${own}`);
                assert.deepStrictEqual(
                  Option.match(expected.routed, {
                    onNone: () => [],
                    onSome: (url) =>
                      assetPaths("items/a.xml", "qti-interaction-module", "primary-path", url),
                  }),
                  expected.files,
                  `${written} as a ${own}: the file it is served from`,
                );
              }),
          ),
        ),
      ),
  );
});
