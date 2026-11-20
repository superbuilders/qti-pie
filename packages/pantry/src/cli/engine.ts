import { Effect, Layer } from "effect";

/**
 * Run `use` on the engine module `load` imports, on `ImportLive` (`#pantry/db/layer.ts`), the
 * author application's pool and login and the file system, beside the local media store
 * (`localMediaStore` of `#pantry/package/media.ts`), the store an import puts a package's media
 * bytes in and an export reads them from: the layers an import and an export run on. Each module
 * loads only once the pool's settings resolve.
 *
 * `Effect.provide` builds the layers before the effect it wraps runs, so the cluster's settings,
 * its CA and the media store's folder are read first, then the author login's committed served
 * workload, and a run whose settings, CA or served file cannot be read fails there, with kind
 * `config`, before `load` runs. The importer and the exporter take the author login from that
 * layer (`AuthorLogin` of `#pantry/db/served.ts`), which grizzle serves from the file as the
 * login's type, with no schema module evaluated and no workload built, so no command pays for one.
 *
 * @param load - Imports the engine module: a dynamic `import()` of it, so the command line's
 *   static graph never reaches it.
 * @param use - The work to run with the loaded module, on the pool.
 * @returns What `use` returns. Fails with what building the pool fails with, and with what `use`
 *   fails with.
 */
export const withAuthorApp = Effect.fn("cli.withAuthorApp")(function* withAuthorApp<M, A, E, R>(
  load: () => Promise<M>,
  use: (engine: M) => Effect.Effect<A, E, R>,
) {
  const [{ ImportLive }, { localMediaStore }, NodePath] = yield* Effect.promise(() =>
    Promise.all([
      import("#pantry/db/layer.ts"),
      import("#pantry/package/media.ts"),
      import("@effect/platform-node/NodePath"),
    ]),
  );
  const live = localMediaStore.pipe(Layer.provideMerge(Layer.merge(ImportLive, NodePath.layer)));

  return yield* Effect.promise(load).pipe(Effect.flatMap(use), Effect.provide(live));
});
