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
import { Effect, Option } from "effect";
import { assetPaths } from "#plate/model/url.ts";
import { pciModulesIn } from "#plate/pci/modules.ts";
import { resolvePciModules } from "#plate/pci/resolve.ts";
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

  it("route each module location to the file reading `pci-module-locations` names, its query and fragment kept apart, its path decoded", () => {
    // Oracle: reading `pci-module-locations` (docs/spec-readings.md), written by hand: a location names its path with
    // `.js` appended unless the file already ends in `.js`, resolved from the package root; its
    // query and fragment are read as reading `href-resolution` reads any href, apart from the file; and its path
    // is percent-decoded as the package names its files (RFC 3986 §2.1), so `%2E` is `.`. A file
    // name is case-sensitive, so `a.JS` does not end in `.js`; a path whose last segment is a dot
    // segment names a directory (RFC 3986 §5.2.4), so `.js` names a file of it, as the database
    // appends `.js` to the resolved path (pantry's `moduleFileOf`); a path climbing above the root
    // names no file of the package (reading `href-resolution`); and an absolute URL is dropped (R5). Each routed
    // form names the file the database resolves.
    // Bound: each form reading `pci-module-locations` distinguishes, as a primary and as a fallback path.
    const forms = [
      ["modules/a", Option.some("modules/a.js"), ["modules/a.js"]],
      ["modules/a.js", Option.some("modules/a.js"), ["modules/a.js"]],
      ["modules/a?v=1", Option.some("modules/a.js?v=1"), ["modules/a.js"]],
      ["modules/a#v1", Option.some("modules/a.js#v1"), ["modules/a.js"]],
      ["modules/a?v=1#v1", Option.some("modules/a.js?v=1#v1"), ["modules/a.js"]],
      ["modules/a.js?v=1", Option.some("modules/a.js?v=1"), ["modules/a.js"]],
      ["modules/a%2Ejs", Option.some("modules/a%2Ejs"), ["modules/a.js"]],
      ["./modules/a", Option.some("./modules/a.js"), ["modules/a.js"]],
      ["modules/a.JS", Option.some("modules/a.JS.js"), ["modules/a.JS.js"]],
      ["modules/b/..", Option.some("modules/b/../.js"), ["modules/.js"]],
      ["modules/b/.", Option.some("modules/b/./.js"), ["modules/b/.js"]],
      ["modules/b/%2E%2E", Option.some("modules/b/%2E%2E/.js"), ["modules/.js"]],
      ["../a", Option.some("../a.js"), []],
      ["https://cdn.example.org/a", Option.none(), []],
    ] as const;

    for (const [written, routed, files] of forms) {
      for (const own of ["primaryPath", "fallbackPath"] as const) {
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

        assert.deepStrictEqual(location, routed, `${written} as a ${own}`);
        assert.deepStrictEqual(
          Option.match(routed, {
            onNone: () => [],
            onSome: (url) =>
              assetPaths("items/a.xml", "qti-interaction-module", "primary-path", url),
          }),
          files,
          `${written} as a ${own}: the file it is served from`,
        );
      }
    }
  });
});
