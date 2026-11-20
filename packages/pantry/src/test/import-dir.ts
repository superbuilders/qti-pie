/**
 * The import of a package at a path, as the tests run it: the package read once, then what was
 * read imported, as the command line's `import` runs them (`#pantry/cli/import.ts`).
 */
import { Effect } from "effect";
import { Db } from "@bjornpagen/grizzle/runtime";
import { AuthorLogin } from "#pantry/db/served.ts";
import { importPackage } from "#pantry/import/package.ts";
import { readPackage } from "#pantry/import/read.ts";
import { nameOf } from "#pantry/test/package-name.ts";

/**
 * Read the package at `dir` under `name` and import what was read: `readPackage`, then
 * `importPackage`.
 *
 * @param dir - The package directory or `.zip` file.
 * @param name - The name it is stored under: by default its directory's base name
 *   (`#pantry/test/package-name.ts` `nameOf`).
 * @returns The name of the committed package and what the import did. Fails as the read fails, then
 *   as the import fails.
 */
export const importDir = (dir: string, name: string = nameOf(dir)) =>
  Effect.gen(function* importDirectory() {
    const db = yield* Db.open((yield* AuthorLogin).roles.author, {});

    return yield* importPackage(db.workload, yield* readPackage(dir, name));
  });
