/**
 * Plate's client components, which a page loads as islands: every export of each `"use client"`
 * module of core, under plate's `src/` outside its `alpha/` folders, from plate's core table of its
 * modules (`@qti-pie/plate/test/modules`, which plate's `pnpm run generate` writes and its
 * `generate:check` holds to its sources), since plate's public client entry re-exports only some of
 * them. Core never imports `alpha/`, and the pages specimen hydrates meet no Alpha island.
 *
 * Test support for plate's UI suite under `src/ui/`. The table imports each client module through
 * `#plate/*`, the module the server shell itself loads, so each export is the very value the
 * shell's elements carry as their type.
 *
 * @module
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clients } from "@qti-pie/plate/test/modules";
import { Effect } from "effect";

/**
 * Plate's `src/`, the folder two above the module its `./ui` entry names, which every client
 * module's name in {@link clientExports} is relative to.
 */
export const plateSource = path.dirname(
  path.dirname(fileURLToPath(import.meta.resolve("@qti-pie/plate/ui"))),
);

/**
 * Every export of plate's `"use client"` modules, by value, with its module and name: the client
 * components the island walk stops at (`islandsIn` in `#specimen/ui/rendered.ts`).
 */
export const clientExports: Effect.Effect<ReadonlyMap<unknown, string>> = Effect.sync(
  () =>
    new Map(
      clients.flatMap(([file, exports]) =>
        exports.map(([name, value]) => [value, `${file}#${name}`] as const),
      ),
    ),
);
