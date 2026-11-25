/**
 * Alpha's Portable Custom Interaction modules, the ones the assessment lead's K–2 and Grade 3
 * mastery forms name. Each is a module file an item's package holds, at the path the item's
 * `qti-interaction-module` names, which the package's loader writes there from
 * {@link AlphaPciModule.script} (the "Module held" law admits a PCI item only when its module is a
 * file of its package), and which a PCI frame host loads by QTI 3.0.1's own module resolution like
 * any author's module. Core plate knows none of them: `alpha/` holds them, and no module outside it
 * imports one.
 *
 * **Why a script with types.** A module file is a classic script the frame's AMD loader runs, so it
 * loads nothing and its text is the code. Its source, `pci-modules/<id>.ts` beside the file, is
 * that script with types: it imports no value and exports nothing, its one statement is the
 * anonymous AMD `define` asking for the `qtiCustomInteractionContext` bridge, and every helper is
 * inside the factory, which registers one factory under the module's type identifier. The file,
 * `pci-modules/<id>.js`, is the source with its types stripped by the machine's Node
 * (`stripTypeScriptTypes`, strip mode, `pnpm --dir packages/plate run emit:alpha-pci-modules`),
 * which blanks each piece of type syntax and keeps every other character where it stands, so a
 * frame's stack trace names the source's own lines and columns, and the bytes depend on the source
 * alone, never on what compiles plate. `#plate/alpha/pci-modules.test.ts` holds each file to its
 * source byte for byte and to its SHA-256 pin, so a change to a file's bytes is a change in review.
 *
 * **Adding a module.** Its source and its emitted file in `pci-modules/`, its entry here, written
 * with {@link alphaPciModule} and listed in {@link alphaPciModules}, and its pin in the test.
 *
 * **Why a leaf.** This module imports nothing, so a host outside qti-pie (AlphaTest's player,
 * through its qti-pie submodule) imports it as TypeScript from its path, with none of plate's
 * dependencies installed, and reads each module's file from its {@link AlphaPciModule.script}.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 * @see https://www.rfc-editor.org/rfc/rfc4198
 */

/**
 * One of Alpha's PCI modules, as its loader writes it into an item's package and a host serves it.
 */
export interface AlphaPciModule<Id extends string> {
  /**
   * The module's id, a kebab-case name: the PCI's `module` attribute, its
   * `qti-interaction-module`'s `id`, and the name of its file.
   */
  readonly id: Id;
  /**
   * Where an item's package holds the module's file: its `qti-interaction-module`'s `primary-path`
   * with `.js` appended.
   */
  readonly path: `modules/${Id}.js`;
  /**
   * The module's file beside this module, `pci-modules/<id>.js`, emitted from its typed source, as
   * a URL: Node reads it with `readFile`, and a bundler that follows `new URL(…, import.meta.url)`
   * serves it as an asset.
   */
  readonly script: URL;
  /**
   * The factory's type identifier, which the item writes as its
   * `custom-interaction-type-identifier` and the module registers with the bridge: a Federated
   * Content URN (RFC 4198), QTI 3.0's recommended form, under Alpha School's namespace.
   */
  readonly typeIdentifier: `urn:fdc:alpha.school:2026:${Id}`;
}

/**
 * Write one of Alpha's PCI modules' entries from its id and its file's URL, the one part written
 * out, since a bundler finds a module's asset only by a literal `new URL(…, import.meta.url)`:
 *
 * ```ts
 * export const countPlacements: AlphaPciModule<"count-placements"> = alphaPciModule(
 *   "count-placements",
 *   new URL("pci-modules/count-placements.js", import.meta.url),
 * );
 * ```
 *
 * @param id The module's id.
 * @param script The URL of `pci-modules/<id>.js` beside this module.
 * @returns The module.
 */
export const alphaPciModule = <const Id extends string>(
  id: Id,
  script: URL,
): AlphaPciModule<Id> => ({
  id,
  path: `modules/${id}.js`,
  script,
  typeIdentifier: `urn:fdc:alpha.school:2026:${id}`,
});

/**
 * Base-ten blocks: a number built from flats, rods and cubes, its response the count of each kind
 * on the mat (`#plate/alpha/pci-modules/build-with-blocks.ts`).
 */
export const buildWithBlocks: AlphaPciModule<"build-with-blocks"> = alphaPciModule(
  "build-with-blocks",
  new URL("pci-modules/build-with-blocks.js", import.meta.url),
);

/**
 * The counter tray: a set built from a tray of identical counters, its response the count on the
 * mat (`#plate/alpha/pci-modules/count-placements.ts`).
 */
export const countPlacements: AlphaPciModule<"count-placements"> = alphaPciModule(
  "count-placements",
  new URL("pci-modules/count-placements.js", import.meta.url),
);

/**
 * Mark objects: identical objects a tap rings and a second tap unrings, its response the count
 * ringed (`#plate/alpha/pci-modules/mark-objects.ts`).
 */
export const markObjects: AlphaPciModule<"mark-objects"> = alphaPciModule(
  "mark-objects",
  new URL("pci-modules/mark-objects.js", import.meta.url),
);

/**
 * Tap to shade the parts of a partitioned shape or of a set of one pictured object, the Grade 3
 * fraction items' PCI (`#plate/alpha/pci-modules/shade-parts.ts`): the response is the number of
 * parts shaded.
 */
export const shadeParts: AlphaPciModule<"shade-parts"> = alphaPciModule(
  "shade-parts",
  new URL("pci-modules/shade-parts.js", import.meta.url),
);

/**
 * Every one of Alpha's PCI modules.
 */
export const alphaPciModules = [
  buildWithBlocks,
  countPlacements,
  markObjects,
  shadeParts,
] as const satisfies readonly AlphaPciModule<string>[];

/**
 * The id of one of Alpha's PCI modules.
 */
export type AlphaPciModuleId = (typeof alphaPciModules)[number]["id"];
