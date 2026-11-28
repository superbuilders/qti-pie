/**
 * Alpha's PCI modules (`#plate/alpha/pci-modules.ts`) against their typed sources and their pins:
 *
 * - Each module file is its source with the types stripped, byte for byte. The oracle is Node's own
 *   type stripping (`stripTypeScriptTypes` of `node:module`, strip mode), the generator's rule, so
 *   a source edited without `generate:alpha-pci-modules` fails here.
 * - Each module file's SHA-256 is its pin in `pci-module-pins.generated.ts` (Bjorn, Q3: the module
 *   file is generated from typed TypeScript), which the generator writes with the files, so a
 *   change to the bytes an item's package holds changes a pin in the same commit, and a file edited
 *   by hand fails here.
 * - Each module's entry is the one {@link alphaPciModule} writes from its id, a kebab-case name, so
 *   its id, path and type identifier agree.
 * - Each module file writes the board style every module shares ({@link alphaPciBoardStyle}).
 * - The folder holds each module's source and file, and nothing else, and each module's URL names its
 *   file there.
 * - Each module file, run as the frame's loader runs it, defines one anonymous AMD module asking for
 *   the bridge alone, whose factory registers one factory under the module's type identifier.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { alphaPciBoardStyle, alphaPciModule, alphaPciModules } from "#plate/alpha/pci-modules.ts";
import type { AlphaPciModuleId } from "#plate/alpha/pci-modules.ts";
import { pinned } from "#plate/alpha/pci-module-pins.generated.ts";
import { lackedIn } from "#plate/test/browser-floor.ts";

/**
 * Each module's board, the element a child presses, taps or drags on, by the selector its file's
 * stylesheet spells it with: the one rule that must carry {@link alphaPciBoardStyle}. A module this
 * table does not name fails to compile, so a new module names its board here.
 */
const board: Readonly<Record<AlphaPciModuleId, string>> = {
  "build-with-blocks": "svg {",
  "count-placements": "[data-board] {",
  "enter-numbers": `\${part("whole")}{`,
  "mark-objects": `\${part("object")}{`,
  "shade-parts": `\${part("model")}{`,
  "tap-point": `\${part("figure")}{`,
};

/**
 * The folder of the module sources and their files.
 */
const folder = path.join(import.meta.dirname, "pci-modules");

/**
 * The files of the module folder, by name: the entries of `alpha/` under it, so a folder that
 * holds no module yet reads as empty.
 *
 * @returns The names, sorted.
 */
const folderFiles = (): readonly string[] =>
  readdirSync(import.meta.dirname, { recursive: true })
    .map(String)
    .filter((entry) => path.dirname(entry) === "pci-modules")
    .map((entry) => path.basename(entry))
    .toSorted();

/**
 * A module file's source: the file beside it named `.ts`.
 *
 * @param file A module file, by its path.
 * @returns Its source, by its path.
 */
const sourceOf = (file: string): string => file.replace(/\.js$/u, ".ts");

/**
 * A module file's pin: its SHA-256, base64, as Subresource Integrity writes it.
 *
 * @param script The module file's URL.
 * @returns The pin.
 */
const pinOf = (script: URL): string =>
  `sha256-${createHash("sha256").update(readFileSync(script)).digest("base64")}`;

/**
 * A factory as a module registers it with the bridge, as far as this suite reads one.
 */
interface Registration {
  readonly getInstance: unknown;
  readonly typeIdentifier: unknown;
}

/**
 * The `qtiCustomInteractionContext` bridge a module's factory is handed.
 */
interface Bridge {
  readonly register: (registration: Registration) => void;
}

/**
 * One `define` call a module file made: its dependencies and its factory.
 */
interface Defined {
  readonly dependencies: readonly string[];
  readonly factory: (bridge: Bridge) => void;
}

/**
 * Run a module file as the frame's loader does, a classic script with `define` as a global, in a
 * context of its own.
 *
 * @param script The module file's text.
 * @returns Each `define` call it made, in order.
 */
const definedBy = (script: string): readonly Defined[] => {
  const calls: Defined[] = [];

  runInNewContext(script, {
    define: (dependencies: Defined["dependencies"], factory: Defined["factory"]) => {
      calls.push({ dependencies, factory });
    },
  });

  return calls;
};

/**
 * Call a module's factory with a bridge that records each factory registered with it.
 *
 * @param defined The module's `define` call.
 * @returns Each factory registered, in order.
 */
const registeredBy = ({ factory }: Defined): readonly Registration[] => {
  const registered: Registration[] = [];

  assert.isFunction(factory);
  factory({
    register: (registration) => {
      registered.push(registration);
    },
  });

  return registered;
};

describe("Alpha's PCI modules", () => {
  it("are each written from their id, a kebab-case name", () => {
    for (const entry of alphaPciModules) {
      assert.match(entry.id, /^[a-z][a-z\d]*(?:-[a-z\d]+)*$/u);
      assert.deepStrictEqual(entry, alphaPciModule(entry.id, entry.script));
    }
  });

  it("are each their typed source with the types stripped, byte for byte", () => {
    for (const { script } of alphaPciModules) {
      const file = fileURLToPath(script);

      assert.strictEqual(
        readFileSync(file, "utf-8"),
        stripTypeScriptTypes(readFileSync(sourceOf(file), "utf-8")),
        `${path.relative(folder, file)} is not its source with the types stripped: run \`pnpm run generate:alpha-pci-modules\` in packages/plate.`,
      );
    }
  });

  it("each hash to their pin", () => {
    assert.deepStrictEqual(
      Object.fromEntries(alphaPciModules.map(({ id, script }) => [id, pinOf(script)])),
      pinned,
      "A module file's bytes changed, or a module has no pin: run `pnpm run generate:alpha-pci-modules` in packages/plate, which writes each pin.",
    );
  });

  it("each give their board the shared board style", () => {
    assert.deepStrictEqual(
      alphaPciModules.flatMap(({ id, script }) => {
        const rules = readFileSync(script, "utf-8")
          .split("\n")
          .map((line) => line.trimStart())
          .filter((line) => line.startsWith(board[id]) || line.startsWith(`\`${board[id]}`));

        return rules.length === 1 && rules[0]?.includes(alphaPciBoardStyle) === true ? [] : [id];
      }),
      [],
      "each module's one board rule, the line its board's selector starts, writes alphaPciBoardStyle",
    );
  });

  it("are the folder's sources and files, each named by its URL", () => {
    assert.deepStrictEqual(
      folderFiles(),
      alphaPciModules
        .flatMap(({ path: inPackage }) => [
          path.basename(inPackage),
          sourceOf(path.basename(inPackage)),
        ])
        .toSorted(),
    );

    for (const { path: inPackage, script } of alphaPciModules) {
      assert.strictEqual(fileURLToPath(script), path.join(folder, path.basename(inPackage)));
    }
  });

  it("each define one module that registers its type identifier with the bridge", () => {
    for (const { script, typeIdentifier } of alphaPciModules) {
      const defined = definedBy(readFileSync(script, "utf-8"));
      const registered = defined.flatMap(registeredBy);

      assert.deepStrictEqual(
        defined.map(({ dependencies }) => dependencies),
        [["qtiCustomInteractionContext"]],
      );
      assert.deepStrictEqual(
        registered.map((registration) => registration.typeIdentifier),
        [typeIdentifier],
      );

      for (const { getInstance } of registered) {
        assert.isFunction(getInstance);
      }
    }
  });

  it("each reach no built-in, DOM member or syntax past the hosts' browser floor", () => {
    assert.deepStrictEqual(
      alphaPciModules.flatMap(({ path: inPackage, script }) => {
        const text = readFileSync(script, "utf-8");
        const name = path.basename(inPackage);

        return lackedIn(name, text).map((later) => `${name}: ${later}`);
      }),
      [],
      "A module file runs as written in the learner's browser, with no polyfill, so each global, static member and syntax it names is fully supported at the floor (`#plate/browser-floor.ts`), in MDN's browser compatibility data.",
    );
  });
});
