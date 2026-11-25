/**
 * Module held: a portable custom interaction's module travels with its content, as a file of its
 * own package, which this delivery system stores and serves as it does any other media, so an
 * item is published only where every module its PCIs load is a file the delivery serves. No
 * registry of modules exists: the module is a resource of the package, its bytes
 * content-addressed, so one module shared by many items is one digest.
 *
 * QTI 3.0.1 lets a PCI load its modules from anywhere: a location that "starts with a protocol
 * (e.g. https://)" is fetched from there, "Otherwise it should be assumed to be a QTI content
 * package relative path" (implementation guide §3.7.12.2), and a module named only in a
 * configuration file's JSON `paths` is resolved there. It also lets the delivery engine narrow
 * that: "A delivery engine MAY ignore any package relative locations which are not defined in the
 * manifest of the QTI content package. A delivery engine MAY apply security rules to the URLs
 * from which it will load Javascript files" (§3.7.12.2), for "a high stakes secure browser context
 * where access is permitted only to files included in the QTI content package" (§3.7.12.1). This
 * one loads no script from outside the package (plate's resolution, R5, `#plate/pci/resolve.ts`),
 * reads no configuration file's `paths` for a file it serves, and serves an item's PCIs only the
 * files the item document names that its media policy lists (`pciFactsOf` and `servedAt`,
 * `#ledger/served-item.ts`; pantry's `ServedFile`), so a module it can load is exactly one a
 * `qti-interaction-module` of the item locates in the package, by its `primary-path` or its
 * `fallback-path` (reading 201), whose file the item's `ServedFile` rows name. A package whose
 * item's PCI names a module of no such location could never render it, and a package is closed,
 * never changed, so it would never be served: it is refused at its publish, naming this law, as
 * "Template held" refuses an item whose template the store does not hold
 * (`#ledger/response-programs.ts`).
 *
 * The law's two sides:
 *
 * - **What is held**: every PCI of an item document names its module, by its `module` attribute, and
 *   lists it, a `qti-interaction-module` of its own whose `id` is that name, each an NCName read
 *   collapsed ({@link PciEntryModule}); and every module such a PCI lists has a location in the
 *   package, a `primary-path` or a `fallback-path` the importer resolved there, `.js` appended
 *   unless its file ends in it ({@link LocatedModule}, pantry's `ReferencePath`).
 * - **What holds it**: the file that location names is one the item document's media is served as
 *   (pantry's `ServedFile`): a `Media` entry of the package, which "File exists" and "File listed"
 *   hold to the manifest, of an extension the player's media policy lists, served by its SHA-256.
 *   The policy is one closed relation (pantry's `mediaPolicy`, `MediaType`), which lists `js`, so a
 *   module at a `.js` path is served wherever the package holds its file.
 *
 * A configuration a PCI's modules child writes (`primary-configuration`, `secondary-configuration`,
 * information model §5.77.1–2: "a JSON configuration file which describes the PCI module
 * configuration to use for this interaction instance") gives its loads' waits, never a location
 * (plate's R2, reading 246), and the law holds it as it holds a module: every configuration a PCI
 * of an item document writes names one of the item's `ServedFile` rows, so the delivery can always
 * read a stated wait ({@link ServedConfiguration}). One the PCI does not write, the schema's
 * default, is no row of `Attribute`, and nothing holds it.
 *
 * Three narrowings of QTI 3.0.1 follow from the delivery's rule, each refused under this law: a PCI
 * that writes no `module` (information model §5.106.2 lets the modules child name every module it
 * loads instead); a module the PCI names that no listed module locates, one a configuration file
 * alone would resolve (§5.77.3: "By default the id will be resolved via the module configuration
 * files"); and a module the PCI lists whose every location is outside the package or names a file
 * the policy withholds (one a library module of the entry's, which the frame could never load).
 *
 * A PCI of a document that is no item is not held: the delivery opens an item document alone,
 * performing no include (reading 217), and shows an interaction of a stimulus as a notice, never
 * running it, so no module of a stimulus's or a fragment's PCI is ever loaded.
 *
 * The response a PCI binds is its own response declaration's, and its grading is the item's
 * response processing, which the SQL grader runs: nothing here reads either.
 *
 * @module
 */
import { contained, derived, on, query, v } from "@bjornpagen/grizzle";
import type { LedgerLevel } from "#ledger/delivery.ts";
import { named } from "#ledger/laws.ts";

/**
 * An item's document's root (information model §4.1, AssessmentItem).
 */
const itemRoot = "qti-assessment-item";

/**
 * The portable custom interaction (information model §5.106, PortableCustomInteraction).
 */
const pciKind = "qti-portable-custom-interaction";

/**
 * A PCI's modules child (information model §5.77, InteractionModules).
 */
const modulesKind = "qti-interaction-modules";

/**
 * One module a PCI lists (information model §7.17, InteractionModule).
 */
const moduleKind = "qti-interaction-module";

/**
 * The configurations a PCI's modules child names (information model §5.77.1–2).
 */
const configurationNames = ["primary-configuration", "secondary-configuration"] as const;

/**
 * The Delivery level's relations and law of the modules a package holds for its items' PCIs.
 *
 * @param ledger - The ledger level the delivery level extends.
 * @returns The relations and laws the delivery level spreads.
 */
export const moduleHeldOf = (ledger: LedgerLevel) => {
  const { Attribute, Document, Node, ReferencePath, ServedFile } = ledger.relations;

  /**
   * The elements of a kind in item documents, by their place: the PCIs, and the modules they list,
   * whose modules the delivery loads.
   *
   * @param kind - The element's kind.
   * @returns The query.
   */
  const inItemsOf = (kind: typeof pciKind | typeof moduleKind) =>
    query(ledger).rule((r) => {
      const { package: pkg, path, start } = v(Node, "element");

      return r
        .match(Node, { kind, package: pkg, path, start })
        .match(Document, { package: pkg, path, rootKind: itemRoot })
        .find({ package: pkg, path, start });
    });

  /**
   * Each PCI of an item document, by its place.
   */
  const ItemPci = derived("ItemPci", inItemsOf(pciKind));

  /**
   * Each module a PCI of an item document lists, by its place.
   */
  const ItemModule = derived("ItemModule", inItemsOf(moduleKind));

  /**
   * Each PCI whose `module` names a module it lists, by its place: a `qti-interaction-module` of
   * its own `qti-interaction-modules` whose `id` is the `module` it writes, the two compared by
   * their values' SHA-256 (`Attribute.valueDigest`), each an `xs:NCName` collapsed (information
   * model §5.106.2: `module` "may be used to provide the Module Id which would be passed at runtime
   * to the PCI API to dynamically load the Javascript module").
   */
  const PciEntryModule = derived(
    "PciEntryModule",
    query(ledger).rule((r) => {
      const { package: pkg, path, start } = v(Node, "pci");
      const { valueDigest } = v(Attribute, "module");
      const { start: modules } = v(Node, "modules");
      const { start: listed } = v(Node, "listed");

      return r
        .match(Node, { kind: pciKind, package: pkg, path, start })
        .match(Attribute, { kind: pciKind, name: "module", package: pkg, path, start, valueDigest })
        .match(Node, { kind: modulesKind, package: pkg, parent: start, path, start: modules })
        .match(Node, { kind: moduleKind, package: pkg, parent: modules, path, start: listed })
        .match(Attribute, {
          kind: moduleKind,
          name: "id",
          package: pkg,
          path,
          start: listed,
          valueDigest,
        })
        .find({ package: pkg, path, start });
    }),
  );

  /**
   * Each listed module with a location whose file its document's media is served as, by its place:
   * a `primary-path` (§7.17.2, "the primary location from which to load the Javascript module") or
   * a `fallback-path` (§7.17.3, "the location from which to load the Javascript module if the
   * module can't be loaded from the primary location") the importer resolved in the package
   * (pantry's `ReferencePath`, reading 201), whose target is one of the document's `ServedFile`s.
   */
  const LocatedModule = derived(
    "LocatedModule",
    query(ledger)
      .rule((r) => {
        const { package: pkg, path, start, target } = v(ReferencePath, "primary");

        return r
          .match(ReferencePath, {
            kind: moduleKind,
            name: "primary-path",
            package: pkg,
            path,
            start,
            target,
          })
          .match(ServedFile, { package: pkg, path, target })
          .find({ package: pkg, path, start });
      })
      .rule((r) => {
        const { package: pkg, path, start, target } = v(ReferencePath, "fallback");

        return r
          .match(ReferencePath, {
            kind: moduleKind,
            name: "fallback-path",
            package: pkg,
            path,
            start,
            target,
          })
          .match(ServedFile, { package: pkg, path, target })
          .find({ package: pkg, path, start });
      }),
  );

  /**
   * Each configuration a PCI of an item document writes, by its modules child's place and its
   * name: a wait the delivery reads (reading 246).
   */
  const ItemConfiguration = derived(
    "ItemConfiguration",
    query(ledger).rule((r) => {
      const { name, package: pkg, path, start } = v(Attribute, "configuration");

      return r
        .match(Attribute, { kind: modulesKind, name, package: pkg, path, start })
        .match(Document, { package: pkg, path, rootKind: itemRoot })
        .where(r.in(name, configurationNames))
        .find({ name, package: pkg, path, start });
    }),
  );

  /**
   * Each configuration the importer resolved in the package (pantry's `ReferencePath`, reading
   * 201) whose target is one of its document's `ServedFile`s, by its modules child's place and its
   * name.
   */
  const ServedConfiguration = derived(
    "ServedConfiguration",
    query(ledger).rule((r) => {
      const { name, package: pkg, path, start, target } = v(ReferencePath, "configuration");

      return r
        .match(ReferencePath, { kind: modulesKind, name, package: pkg, path, start, target })
        .match(ServedFile, { package: pkg, path, target })
        .where(r.in(name, configurationNames))
        .find({ name, package: pkg, path, start });
    }),
  );

  /**
   * Module held: every PCI of an item names a module it lists, every module such a PCI lists has a
   * location in its package whose file the delivery serves, and every configuration it writes is
   * such a file; so every module a stored item's PCI loads is a file of its package, served by its
   * digest, and every wait it states is read.
   */
  const moduleHeld = [
    named(
      "Module held",
      contained(
        on(ItemPci, "package", "path", "start"),
        on(PciEntryModule, "package", "path", "start"),
      ),
    ),
    named(
      "Module held",
      contained(
        on(ItemModule, "package", "path", "start"),
        on(LocatedModule, "package", "path", "start"),
      ),
    ),
    named(
      "Module held",
      contained(
        on(ItemConfiguration, "package", "path", "start", "name"),
        on(ServedConfiguration, "package", "path", "start", "name"),
      ),
    ),
  ] as const;

  return {
    laws: moduleHeld,
    relations: [
      ItemPci,
      ItemModule,
      PciEntryModule,
      LocatedModule,
      ItemConfiguration,
      ServedConfiguration,
    ],
  } as const;
};
