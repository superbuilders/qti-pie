/**
 * Plate's client components, which a page loads as islands: every export of each `"use client"`
 * module under plate's `src/`, found by its directive, since plate's public client entry re-exports
 * only some of them.
 *
 * Test support for plate's UI suite under `src/ui/`. It reads plate's source from where its
 * `./ui` entry resolves and loads each module by its file, the module the server shell itself
 * loads, so each export is the very value the shell's elements carry as their type.
 *
 * @module
 */
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Effect, Schema } from "effect";

/**
 * A module's first statement as the `"use client"` directive, after any comments.
 */
const useClient = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*(?<quote>["'])use client\k<quote>/u;

/**
 * A module's exports as a host reads them: a record of values by name.
 */
const ModuleExports = Schema.Record(Schema.String, Schema.Unknown);

/**
 * Plate's `src/`, the folder two above the module its `./ui` entry names.
 */
const plateSource = path.dirname(
  path.dirname(createRequire(import.meta.url).resolve("@qti-pie/plate/ui")),
);

/**
 * Every export of plate's `"use client"` modules, by value, with its module and name: the client
 * components the island walk stops at (`islandsIn` in `#specimen/ui/rendered.ts`).
 */
export const clientExports: Effect.Effect<ReadonlyMap<unknown, string>> = Effect.forEach(
  readdirSync(plateSource, { encoding: "utf-8", recursive: true })
    .filter(
      (file) =>
        /\.tsx?$/u.test(file) &&
        !/\.test\.tsx?$/u.test(file) &&
        useClient.test(readFileSync(path.join(plateSource, file), "utf-8")),
    )
    .toSorted(),
  (file) =>
    Effect.promise(() => import(pathToFileURL(path.join(plateSource, file)).href)).pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(ModuleExports)),
      Effect.map((exports) =>
        Object.entries(exports).map(([name, value]) => [value, `${file}#${name}`] as const),
      ),
      Effect.orDie,
    ),
).pipe(Effect.map((exported) => new Map(exported.flat())));
