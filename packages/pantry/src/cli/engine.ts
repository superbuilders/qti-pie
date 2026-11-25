/**
 * The engine side of the command line: what only `qti-import`, `qti-export` and `qti-roundtrip`
 * load, each statically, so `qti` (help, schema and completions over the commands' definitions)
 * never does.
 *
 * @module
 */
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, Layer } from "effect";
import { BadName } from "#pantry/cli/args.ts";
import { ImportLive } from "#pantry/db/layer.ts";
import { localMediaStore } from "#pantry/package/media.ts";
import { isPackageName } from "#pantry/qti/limits.ts";

/**
 * Parse the package name the person gave, once, before anything opens the database: an NCName of
 * at most 255 UTF-8 bytes, `PackageName`'s language (`isPackageName`, `#pantry/qti/limits.ts`), so
 * every text it accepts is one a package can be stored under.
 *
 * @param name - The name the person gave.
 * @returns The name. Fails with `BadName` when no package can be stored under the text.
 */
export const requireName = Effect.fn("cli.requireName")(function* requireName(name: string) {
  if (!isPackageName(name)) {
    return yield* new BadName({ name });
  }

  return name;
});

/**
 * Run `use` on `ImportLive` (`#pantry/db/layer.ts`), the author application's pool and login and
 * the file system, beside the local media store (`localMediaStore` of `#pantry/package/media.ts`),
 * the store an import puts a package's media bytes in and an export reads them from: the layers an
 * import and an export run on.
 *
 * `Effect.provide` builds the layers before the effect it wraps runs, so the cluster's settings,
 * its CA and the media store's folder are read first, then the author login's committed served
 * workload, and a run whose settings, CA or served file cannot be read fails there, with kind
 * `config`, before `use` runs. The importer and the exporter take the author login from that layer
 * (`AuthorLogin` of `#pantry/db/served.ts`), which grizzle serves from the file as the login's
 * type, with no schema module evaluated and no workload built, so no command pays for one.
 *
 * @param use - The work to run on the pool.
 * @returns What `use` returns. Fails with what building the pool fails with, and with what `use`
 *   fails with.
 */
export const withAuthorApp = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  use.pipe(
    Effect.provide(
      localMediaStore.pipe(Layer.provideMerge(Layer.merge(ImportLive, NodePath.layer))),
    ),
  );
