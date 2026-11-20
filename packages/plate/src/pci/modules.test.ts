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
});
