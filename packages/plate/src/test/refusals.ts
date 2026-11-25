/**
 * Test support: calls plate's types refuse, held by the compiler. A test writes the calls a type
 * must refuse into a module of its own, held in memory beside plate's sources so its `#plate/*`
 * imports resolve, and compiles it with TypeScript's native compiler (`typescript/sync`) under
 * plate's compiler options (`tsconfig.json`), each call on a line of its own after the module's
 * imports and declarations. {@link refusedCalls} names each diagnostic by the line it starts on, so
 * a test holds every call to exactly the diagnostic it names: a call that compiles, or that the
 * compiler refuses for another reason, fails it, and so does a broken import or declaration.
 *
 * @module
 */
import path from "node:path";
import { Effect } from "effect";
import { serverFS } from "typescript/fs";
import { API } from "typescript/sync";

/**
 * A diagnostic of the compiled module: the line it starts on and its code, TypeScript's (2345, an
 * argument not assignable to its parameter's type, among them).
 */
export interface Refused {
  readonly code: number;
  readonly line: string;
}

/**
 * The package's root, whose `tsconfig.json` the module compiles under.
 */
const packageRoot = path.resolve(import.meta.dirname, "..", "..");

/**
 * Where the module stands, in plate's `src/` beside the sources it imports; no file is there, and
 * the compiler reads it from memory alone.
 */
const modulePath = path.join(packageRoot, "src", "refused-calls.ts");

/**
 * Compile a module of the given imports and declarations, then the given calls, each on a line of
 * its own, and give every diagnostic the compiler gives it, syntactic and semantic, in the order of
 * the lines they start on.
 *
 * @param head The module's imports and declarations, a line each.
 * @param calls The calls, a line each.
 * @returns Each diagnostic, as the line it starts on and its code.
 */
export const refusedCalls = (
  head: readonly string[],
  calls: readonly string[],
): Effect.Effect<readonly Refused[]> => {
  const lines = [...head, ...calls];
  const text = lines.join("\n");

  return Effect.acquireUseRelease(
    Effect.sync(
      () =>
        new API({
          cwd: packageRoot,
          fs: {
            directoryExists: serverFS.useOS,
            fileExists: (name) => (name === modulePath ? true : serverFS.useOS),
            getAccessibleEntries: serverFS.useOS,
            readFile: (name) => (name === modulePath ? text : serverFS.useOS),
            realpath: (name) => (name === modulePath ? serverFS.identity : serverFS.useOS),
            removeFile: serverFS.error,
            stat: (name) => (name === modulePath ? serverFS.fakeStat : serverFS.useOS),
            writeFile: serverFS.error,
          },
        }),
    ),
    (api) =>
      Effect.sync(() => {
        const program = api.createProgram(
          [modulePath],
          api.parseConfigFile(path.join(packageRoot, "tsconfig.json")).options,
        );

        return [
          ...program.getSyntacticDiagnostics(modulePath),
          ...program.getSemanticDiagnostics(modulePath),
        ]
          .map((diagnostic) => ({
            at: diagnostic.startPosition?.line ?? -1,
            code: diagnostic.code,
          }))
          .toSorted((one, other) => one.at - other.at)
          .map(({ at, code }) => ({ code, line: lines[at] ?? `line ${String(at)}` }));
      }),
    (api) =>
      Effect.sync(() => {
        api.close();
      }),
  );
};
