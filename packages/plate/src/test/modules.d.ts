/**
 * Every script entry of plate's exports map but this table's own, by its subpath, and every
 * `"use client"` module under plate's `src/`, by its path there, each with its module's exports,
 * imported statically: the entries through the package's own name, as a host loads them, and the
 * client modules through `#plate/*`, as the server shell does. Written by
 * `src/test/emit-modules.ts` (`pnpm run generate`), which `pnpm run generate:check` holds it to.
 *
 * @module
 */

/**
 * The exports map's script entries, each subpath with its module's exports, in the map's order.
 */
export declare const entries: readonly (readonly [
  subpath: string,
  exports: Readonly<Record<string, unknown>>,
])[];

/**
 * The `"use client"` modules, each path under `src/` with its module's exports, sorted.
 */
export declare const clients: readonly (readonly [
  file: string,
  exports: Readonly<Record<string, unknown>>,
])[];
