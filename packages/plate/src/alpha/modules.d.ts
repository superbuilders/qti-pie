/**
 * Plate's table of Alpha's modules, every one inside an `alpha/` folder: each script entry of the
 * exports map, by its subpath, and each `"use client"` module under `src/`, by its path there, with
 * its exports as name and value pairs, imported statically: the entries through the package's own
 * name, as a host loads them, and the client modules through `#plate/*`, as the server shell does,
 * but a client module an entry names, imported once, through its entry. `src/test/emit-modules.ts`
 * writes it, and its check holds it to the sources.
 *
 * @module
 */

/**
 * The table's script entries, each subpath with its module's exports, in the map's order.
 */
export declare const entries: readonly (readonly [
  subpath: string,
  exports: readonly (readonly [name: string, value: unknown])[],
])[];

/**
 * The table's `"use client"` modules, each path under `src/` with its exports, sorted.
 */
export declare const clients: readonly (readonly [
  file: string,
  exports: readonly (readonly [name: string, value: unknown])[],
])[];
