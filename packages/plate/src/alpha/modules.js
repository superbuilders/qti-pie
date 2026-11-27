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
import * as entry0 from "@qti-pie/plate/alpha";
import * as entry1 from "@qti-pie/plate/alpha/math-entry";
import * as entry2 from "@qti-pie/plate/alpha/pci-modules";
import * as client0 from "#plate/alpha/math-entry/math-entry.tsx";

/**
 * The table's script entries, each subpath with its module's exports, in the map's order.
 */
export const entries = Object.freeze([
  ["./alpha", Object.entries(entry0)],
  ["./alpha/math-entry", Object.entries(entry1)],
  ["./alpha/pci-modules", Object.entries(entry2)],
]);

/**
 * The table's `"use client"` modules, each path under `src/` with its exports, sorted.
 */
export const clients = Object.freeze([
  ["alpha/math-entry/math-entry.tsx", Object.entries(client0)],
]);
