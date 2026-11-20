/**
 * The module facts of an item's Portable Custom Interactions (Q-16), as a host needs them to say
 * where each PCI's modules load from: {@link pciModulesIn} gives each PCI's response identifier
 * and its module facts as written (`PciModules`), the input `resolvePciModules`
 * (`#plate/pci/resolve.ts`) takes with the package's files. The host resolves each against the
 * package it holds, serves the routes, and passes them by response identifier as its `pci` facts
 * (`PciHostFacts` in `#plate/pci/host.ts`), which is how the page learns where a PCI runs: the
 * payload never carries a path the host has not classified.
 *
 * @module
 */
import type { PortableCustomInteraction } from "#plate/interactions/portable-custom.ts";
import { interactionsIn } from "#plate/model/interactions.ts";
import type { PciModules } from "#plate/pci/resolve.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * One Portable Custom Interaction's module facts: the response it binds, which keys the host's
 * routes for it, and its `module` attribute and `qti-interaction-modules` as written.
 */
export interface PciInteractionModules {
  readonly modules: PciModules;
  readonly response: string;
}

/**
 * Give a PCI's module facts as `resolvePciModules` takes them: its `module` attribute, and its
 * `qti-interaction-modules`' two configurations and modules, the configurations' default paths and
 * no module where it writes no `qti-interaction-modules`.
 *
 * @param pci The PCI's model node.
 * @returns Its module facts.
 */
const modulesOf = (pci: PortableCustomInteraction): PciModules => ({
  ...pci.modules,
  module: pci.module,
});

/**
 * Give the module facts of every Portable Custom Interaction of an accepted item, in document
 * order: each one in the body, inside a template or feedback block or inline whatever the record
 * will show of it, so a host routes every PCI a page may show.
 *
 * @example
 *   const routes = new Map(
 *     pciModulesIn(accepted).map(({ modules, response }) => [
 *       response,
 *       resolvePciModules(modules, read, listed).routes,
 *     ]),
 *   );
 *
 * @param accepted The item, as `acceptedItem` gives it.
 * @returns Each PCI's response identifier and module facts; none for an item with no PCI.
 */
export const pciModulesIn = (accepted: Accepted): readonly PciInteractionModules[] =>
  interactionsIn(accepted.item.body).flatMap((node) =>
    node.kind === "portable-custom" ? [{ modules: modulesOf(node), response: node.response }] : [],
  );
