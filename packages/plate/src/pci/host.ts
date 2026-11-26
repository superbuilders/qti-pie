/**
 * The facts a host knows and plate does not, carried to an interaction module's `redact` through
 * the kit (`RedactKit.host` in `#plate/interactions/contract.ts`): the one seam a module reads
 * what only its host can tell it, such as the URL of a script the host serves. Types only: this
 * module holds no runtime value.
 *
 * The facts travel as a page input, through the view's `host` and the payload build, and never as
 * item data: nothing of them reaches the redacted item or the `Payload` itself. A
 * module that reads a member bakes what its interaction needs into its own payload node; a module
 * whose member is absent redacts as with none.
 *
 * @module
 */
import type { Option } from "effect";
import type { ModuleFallback } from "#plate/pci/resolve.ts";

/**
 * Where a host resolved one of a PCI's modules: the field names of `ModuleRoute` in
 * `#plate/pci/resolve.ts` (issue pci-01), so the frame host (issue pci-04) maps one onto the other
 * with no translation. `id` is the module's AMD id, `primary` its primary location as the host
 * will serve it, and `fallback` its fallback's, with how long the primary is waited for before it
 * (`ModuleFallback`), each none when the module has none. A host that drops a fallback it does not
 * serve drops its wait with it, so a primary left alone waits for its own script and never for a
 * clock (R3).
 */
export interface PciModuleRoute {
  readonly fallback: Option.Option<ModuleFallback>;
  readonly id: string;
  readonly primary: Option.Option<string>;
}

/**
 * What the frame host (issue pci-04) tells the PCI module: `loader`, the URL at which it serves
 * the frame page (`framePage` of `@qti-pie/plate/ui/pci-frame`), the one document every PCI's
 * sandboxed frame loads, whose boot is the AMD loader; and, by response identifier, the module
 * routes it resolved for each PCI of the item and will serve. A response the map omits has no
 * resolved module, and the PCI bound to it renders as with no facts.
 */
export interface PciHostFacts {
  readonly loader: string;
  readonly modules: ReadonlyMap<string, readonly PciModuleRoute[]>;
}

/**
 * The closed record of what a host knows and plate does not: one optional member per consumer,
 * each the one module that reads it, and no other member. A host cannot add one: a consumer
 * without a member here has no host facts, and a module reads only its own member, never
 * another's. The record is a render input, never item data: it never reaches the redacted item or
 * its JSON, and the `Payload` holds none of it. `pci` is the frame host's
 * ({@link PciHostFacts}, issue pci-04).
 */
export interface HostFacts {
  readonly pci?: PciHostFacts;
}
