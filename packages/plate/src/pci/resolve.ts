/**
 * Module resolution for a portable custom interaction (issue pci-01, a server module):
 * {@link resolvePciModules} says, for one PCI in an opened package, where each of its AMD modules
 * loads from, the primary and the fallback URL of every module with the wait before its fallback,
 * and a typed {@link PciNotice} for each route that cannot resolve. The frame host (issue pci-04)
 * consumes the {@link PciResolution}; nothing here loads or fetches a URL.
 *
 * The QTI 3 module-resolution rules, from the implementation guide and the information model: a PCI
 * names its module with the `module` attribute or lists its modules in `qti-interaction-modules`,
 * whose `primary-configuration` (default `modules/module_resolution.js`) and
 * `secondary-configuration` (default `modules/fallback_module_resolution.js`) name two
 * configuration files, and whose `qti-interaction-module` children each carry an `id` and may carry
 * a `primary-path` and a `fallback-path`. A module `N` loads from its own `primary-path`; on a
 * timeout or a fatal error it loads from its own `fallback-path`. The guide (informative, reading
 * `response-processing-resource-type`) lets a configuration's `paths[N]` stand in for either; this
 * delivery reads none (R2). A configuration file is a JSON document despite its `.js` name:
 * `waitSeconds`, how long to wait for each file before falling back (default 7; 0 is no timeout),
 * and `paths`, module name to location without a file extension. A location that starts with a
 * protocol is fetched from there; any other is a path relative to the content package's base. A
 * delivery engine may ignore a package-relative location the manifest does not list, and may apply
 * security rules to the URLs it loads script from.
 *
 * Reading `pci-secondary-configuration` binds the attribute names: **A PCI's secondary module
 * configuration is `secondary-configuration`.** An item writing `fallback-configuration` is refused
 * before it reaches here, and that attribute is never read.
 *
 * Where the sources are silent, these defaults apply, each named where it is applied:
 *
 * - **R1** `.js` is appended to a location's path unless the file it names already ends in `.js`, so
 *   it is never doubled (reading `pci-module-locations`): the path is the location before its query
 *   and fragment, the file is that path resolved from the package root and percent-decoded, as the
 *   package names its files (`resolveIn`, the database's `moduleFileOf` reads it the same way), and
 *   `.js` goes after the path, before the query and the fragment, which name no part of the file; a
 *   path whose last segment is a dot segment names a directory, so `.js` names a file of it
 *   (`modules/b/..` names `modules/.js`), as the database appends `.js` to the resolved path.
 * - **R2** A configuration contributes at most its `waitSeconds`, never a location: its `paths` and
 *   every other member are passed over, so a module loads only from its own `primary-path` and
 *   `fallback-path` (reading `pci-configuration-waits`: the information model gives a configuration
 *   "to use", and the guide, informative, lets the delivery "apply security rules to the URLs from
 *   which it will load Javascript files"). A configuration file absent from the package contributes
 *   nothing and no notice; one present but not a JSON object with, where written, a non-negative
 *   finite `waitSeconds` gives `pci-configuration-invalid` and contributes nothing.
 * - **R3** A timeout means only "load the fallback" (reading `pci-wait-before-fallback`): a primary
 *   with a fallback after it is waited for the primary configuration's `waitSeconds`, 7 when absent
 *   and no limit for 0, and then the fallback loads; a location with nothing after it, a primary
 *   with no fallback or any fallback, waits for its own script's load or error and never for a
 *   clock. So a route holds a wait only inside its fallback, and the secondary configuration's
 *   `waitSeconds` times nothing: that file is read for R2's notice alone.
 * - **R4** A module with no location at all, primary or fallback, gives `pci-module-unresolved`; one
 *   with no fallback has no second chance and no timeout (R3); one with a fallback alone loads from
 *   it at once, since the frame tries the fallback where no primary is given.
 * - **R5** A package-relative location the manifest does not list is kept and gives
 *   `pci-module-unlisted`; an absolute location, of any scheme, is dropped and gives
 *   `pci-module-remote`: plate loads no script from outside the package, whose files alone the host
 *   vets ("may apply security rules to the URLs it loads script from", above), so a module whose
 *   primary is a CDN's loads from its package fallback, as the implementation guide reads a
 *   package-only context (informative, §3.7.12.1: "a high stakes secure browser context where
 *   access is permitted only to files included in the QTI content package").
 * - **R6** Without `module`, every listed module is loaded, and the frame takes as the factory the
 *   one module that registers.
 *
 * (R7, the type-identifier rule, is `pci/type-identifier.ts`'s, since it runs in the frame.)
 *
 * @module
 */
import { regex } from "arkregex";
import { Option, Result, Schema } from "effect";
import { isDotSegment, resolveIn, withoutQuery } from "#plate/document/href.ts";
import { packageRootDocument } from "#plate/model/url.ts";

/**
 * The module facts of one `qti-portable-custom-interaction`: its `module` attribute, the
 * `primary-configuration` and `secondary-configuration` of its `qti-interaction-modules`, and each
 * `qti-interaction-module` child's `id`, `primary-path` and `fallback-path`. Issue pci-03's model
 * maps onto it. The schema's default for an absent configuration (`modules/module_resolution.js`,
 * `modules/fallback_module_resolution.js`) is applied once, where the PCI is read
 * (`#plate/interactions/portable-custom.ts`), so each configuration is the path resolution reads.
 */
export interface PciModules {
  readonly module: Option.Option<string>;
  readonly modules: readonly {
    readonly fallbackPath: Option.Option<string>;
    readonly id: string;
    readonly primaryPath: Option.Option<string>;
  }[];
  readonly primaryConfiguration: string;
  readonly secondaryConfiguration: string;
}

/**
 * A module's second chance (R3, R4): the `location` it loads from when its primary cannot load,
 * and `primaryWaitSeconds`, how long the primary is waited for before this location loads instead,
 * 0 for no limit, so that only the primary's error reaches it. The wait is the fallback's because a
 * timeout means nothing but "load the fallback": a route with no fallback holds no wait to time
 * its primary out by, and the fallback's own load is never timed. A route with no primary loads
 * its fallback at once, and the wait times nothing.
 */
export interface ModuleFallback {
  readonly location: string;
  readonly primaryWaitSeconds: number;
}

/**
 * Where one AMD module loads from.
 *
 * `primary` and the `fallback`'s `location` are paths relative to the package's base, each ending
 * in `.js` exactly once (R1), never an absolute URL (R5). The fallback is tried after the primary
 * fails fatally or its wait runs out; a module with none has no second chance and its primary no
 * timeout (R3, R4).
 */
export interface ModuleRoute {
  readonly fallback: Option.Option<ModuleFallback>;
  readonly id: string;
  readonly primary: Option.Option<string>;
}

/**
 * One PCI's resolved modules: what the frame host loads, and what could not be resolved.
 */
export interface PciResolution {
  /**
   * The module the PCI names with `module`, the one the host requires first; none when the PCI
   * lists its modules without naming one, and every listed module is loaded (R6).
   */
  readonly entry: Option.Option<string>;
  /**
   * The routes of every module the PCI names: the entry first when it is written, then the listed
   * modules in their order, each id once.
   */
  readonly routes: readonly ModuleRoute[];
  /**
   * The notices, in order: the primary configuration's, the secondary's, then each route's in
   * route order (its primary location's, its fallback location's, then `pci-module-unresolved`).
   */
  readonly notices: readonly PciNotice[];
}

/**
 * Why a module's route is incomplete or suspect, for the frame host to show or log.
 *
 * `pci-configuration-invalid` (R2) names a configuration `file` the package holds that is not a
 * JSON object with, when written, a non-negative finite `waitSeconds`. `pci-module-unresolved` (R4)
 * names a module with no location at all. `pci-module-unlisted` (R5) names a module and its
 * package-relative `location`, kept though the manifest does not list it. `pci-module-remote` (R5)
 * names a module and its absolute `location`, dropped since plate loads no script from outside the
 * package.
 */
export type PciNotice =
  | { readonly kind: "pci-configuration-invalid"; readonly file: string }
  | { readonly kind: "pci-module-remote"; readonly id: string; readonly location: string }
  | { readonly kind: "pci-module-unlisted"; readonly id: string; readonly location: string }
  | { readonly kind: "pci-module-unresolved"; readonly id: string };

/**
 * The `waitSeconds` of a configuration that writes none, and of an absent or invalid
 * configuration: the guide's default (§3.7.12.2, "If "waitSeconds" is not specified then a default
 * of 7 seconds should be assumed"), which times a primary with a fallback alone (R3).
 */
const defaultWaitSeconds = 7;

/**
 * What a configuration file contributes, after R2 and R3: its timeout alone.
 */
interface Configuration {
  readonly waitSeconds: number;
}

/**
 * The configuration an absent or invalid file contributes: the default timeout.
 */
const emptyConfiguration: Configuration = { waitSeconds: defaultWaitSeconds };

/**
 * A configuration file as read: its content after R2 and R3, and the notice R2 gives.
 */
interface ReadConfiguration {
  readonly configuration: Configuration;
  readonly notices: readonly PciNotice[];
}

/**
 * A module's location placed as a URL, or dropped, with the notices R5 gives.
 */
interface PlacedLocation {
  readonly notices: readonly PciNotice[];
  readonly url: Option.Option<string>;
}

/**
 * One module routed, with its notices.
 */
interface RoutedModule {
  readonly notices: readonly PciNotice[];
  readonly route: ModuleRoute;
}

/**
 * The listed module facts of one id: the `qti-interaction-module` child of that `id`.
 */
type ListedModule = PciModules["modules"][number];

/**
 * The shape a configuration file must have (R2): a JSON object with, when written, a non-negative
 * finite `waitSeconds`. Any other member, `paths` and RequireJS's `baseUrl` or `shim` among them,
 * is passed over.
 */
const ConfigurationFile = Schema.Struct({
  waitSeconds: Schema.optionalKey(Schema.Finite.check(Schema.isGreaterThanOrEqualTo(0))),
});

/**
 * Decode a configuration file's text as {@link ConfigurationFile}.
 */
const decodeConfiguration = Schema.decodeUnknownResult(Schema.fromJsonString(ConfigurationFile));

/**
 * A location that starts with a protocol: an RFC 3986 scheme and its colon.
 *
 * @see https://www.rfc-editor.org/rfc/rfc3986#section-3.1
 */
const schemePrefix = regex("^[A-Za-z][A-Za-z0-9+.-]*:", "u");

/**
 * Read a configuration file from the package (R2, R3).
 *
 * @param file The file's package-relative path, as written or defaulted.
 * @param files The package's files, by path.
 * @returns The configuration, with `pci-configuration-invalid` when the file is held but is not a
 *   configuration; the empty configuration and no notice when the package holds no such file.
 */
const readConfiguration = (
  file: string,
  files: (path: string) => Option.Option<string>,
): ReadConfiguration =>
  Option.match(files(file), {
    onNone: () => ({ configuration: emptyConfiguration, notices: [] }),
    onSome: (text) =>
      Result.match(decodeConfiguration(text), {
        onFailure: () => ({
          configuration: emptyConfiguration,
          notices: [{ file, kind: "pci-configuration-invalid" }],
        }),
        onSuccess: (decoded) => ({
          configuration: { waitSeconds: decoded.waitSeconds ?? defaultWaitSeconds },
          notices: [],
        }),
      }),
  });

/**
 * The suffix R1 gives a module's file, which the implementation guide assumes of every location
 * (Appendix D: "'.js' will be assumed").
 */
const scriptSuffix = ".js";

/**
 * Append `.js` to a location's path where the file it names does not already end in it (R1): the
 * path, the location before its query and fragment, resolved from the package root and
 * percent-decoded as the package names its files, decides, so `modules/a%2Ejs` names
 * `modules/a.js`; `.js` goes after the path, so `modules/a?v=1` names `modules/a.js` and keeps its
 * query. A path whose last segment is a dot segment (`isDotSegment`) resolves to a directory, so
 * `.js` goes after a `/`, naming the file of that directory the database names: `modules/b/..`
 * names `modules/.js`, never `modules/b/...js`. A path that names no file of the package (a remote
 * one, or one climbing above the root) is read as written.
 *
 * @param location The location, as a configuration or a module attribute writes it.
 * @returns The location whose path names a file ending in `.js` once.
 */
export const scriptLocationOf = (location: string): string => {
  const path = withoutQuery(location);
  const file = Option.getOrElse(resolveIn(packageRootDocument, path), () => path);
  const separator = isDotSegment(path.slice(path.lastIndexOf("/") + 1)) ? "/" : "";

  return file.endsWith(scriptSuffix)
    ? location
    : `${path}${separator}${scriptSuffix}${location.slice(path.length)}`;
};

/**
 * Turn a module's location into the URL the host loads, by R1 and R5.
 *
 * @param id The module's id, for the notices.
 * @param location The location, when the module has one.
 * @param listed Whether the manifest lists a package-relative path.
 * @returns The URL, dropped for an absolute location, with the notices R5 gives.
 */
const placeLocation = (
  id: string,
  location: Option.Option<string>,
  listed: (path: string) => boolean,
): PlacedLocation =>
  Option.match(location, {
    onNone: () => ({ notices: [], url: Option.none() }),
    onSome: (written) => {
      const url = scriptLocationOf(written);

      if (schemePrefix.test(url)) {
        return { notices: [{ id, kind: "pci-module-remote", location: url }], url: Option.none() };
      }

      return {
        notices: listed(url) ? [] : [{ id, kind: "pci-module-unlisted", location: url }],
        url: Option.some(url),
      };
    },
  });

/**
 * Route one module: its own paths alone (R2), its primary waited for the primary configuration's
 * time where a fallback follows it, and never otherwise (R3, R4).
 *
 * @param id The module's id.
 * @param written The module's `qti-interaction-module`, when the PCI lists one.
 * @param primary The primary configuration, whose wait its fallback holds.
 * @param listed Whether the manifest lists a package-relative path.
 * @returns The route and its notices: the primary location's, the fallback location's, then
 *   `pci-module-unresolved` when no URL remains, primary or fallback.
 */
const routeModule = (
  id: string,
  written: Option.Option<ListedModule>,
  primary: Configuration,
  listed: (path: string) => boolean,
): RoutedModule => {
  const own = Option.match(written, {
    onNone: () => ({ fallbackPath: Option.none<string>(), primaryPath: Option.none<string>() }),
    onSome: (module) => ({ fallbackPath: module.fallbackPath, primaryPath: module.primaryPath }),
  });
  const placedPrimary = placeLocation(id, own.primaryPath, listed);
  const placedFallback = placeLocation(id, own.fallbackPath, listed);

  return {
    notices: [
      ...placedPrimary.notices,
      ...placedFallback.notices,
      ...(Option.isNone(placedPrimary.url) && Option.isNone(placedFallback.url)
        ? [{ id, kind: "pci-module-unresolved" } as const]
        : []),
    ],
    route: {
      fallback: placedFallback.url.pipe(
        Option.map((location) => ({ location, primaryWaitSeconds: primary.waitSeconds })),
      ),
      id,
      primary: placedPrimary.url,
    },
  };
};

/**
 * Resolve where each module of one PCI loads from, by the module-resolution rules and the
 * defaults R1 to R6 the module doc states.
 *
 * The routes cover the module the PCI names with `module` and every module it lists, each id once,
 * the entry first; a module named by `module` alone has no location (R2, R4). Both configuration
 * files are read from the package by their written or default paths, never fetched, the primary for
 * its wait and both for R2's notice: one named by an absolute URL is not held, so it contributes
 * nothing, as an absent file does. Paths reach `files` and `listed` as the document writes them,
 * with `.js` appended; normalising them is the caller's, which holds the package.
 *
 * @param modules The interaction's module facts, as written.
 * @param files Read a package-relative file: its text, none when the package holds no such file.
 * @param listed Whether the manifest lists a package-relative path.
 * @returns The entry, the routes and the notices.
 */
export const resolvePciModules = (
  modules: PciModules,
  files: (path: string) => Option.Option<string>,
  listed: (path: string) => boolean,
): PciResolution => {
  const primary = readConfiguration(modules.primaryConfiguration, files);
  const secondary = readConfiguration(modules.secondaryConfiguration, files);
  const ids = [
    ...new Set([...Option.toArray(modules.module), ...modules.modules.map((module) => module.id)]),
  ];
  const routed = ids.map((id) =>
    routeModule(
      id,
      Option.fromNullishOr(modules.modules.find((module) => module.id === id)),
      primary.configuration,
      listed,
    ),
  );

  return {
    entry: modules.module,
    notices: [
      ...primary.notices,
      ...secondary.notices,
      ...routed.flatMap((module) => module.notices),
    ],
    routes: routed.map((module) => module.route),
  };
};
