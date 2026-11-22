import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import { Db, DbLayer, LiveSource, served } from "@bjornpagen/grizzle/runtime";
import type { PoolBounds } from "@bjornpagen/grizzle/runtime";
import { Effect, FileSystem, Layer, Schema } from "effect";
import { loginConnection, primedLoginConnection } from "#pantry/db/connection.ts";
import { AuthorLogin, ServedLoadError, ServedText, servedPath } from "#pantry/db/served.ts";
import type { AuthorAppLogin } from "#pantry/qti/logins.ts";

/**
 * The most sessions the author application's pool holds: node-postgres's own default, since
 * pantry's calls on a `Db` run one after another and no measurement asks for another number.
 * grizzle chooses no size, and takes the caller's `PoolBounds`.
 *
 * @limitKind published
 * @owner pg-pool 3.14.0 (node-postgres's Pool, which grizzle's session pool is)
 * @unit sessions
 * @scope one pool's sessions, pg-pool's default where its caller gives no max
 * @constraint configurable default
 * @source https://github.com/brianc/node-postgres/blob/pg-pool%403.14.0/packages/pg-pool/index.js#L89
 * @quote this.options.max = this.options.max || this.options.poolSize || 10
 * @verified 2026-11-16
 */
const pgPoolMaxDefault = 10;

/**
 * How long a session past the pool's kept minimum stays open after its last use: node-postgres's
 * own default, so a process between calls holds the one session it keeps.
 *
 * @limitKind published
 * @owner pg-pool 3.14.0 (node-postgres's Pool, which grizzle's session pool is)
 * @unit milliseconds
 * @scope each idle session of one pool past its minimum, pg-pool's default where its caller gives none
 * @constraint configurable default
 * @source https://github.com/brianc/node-postgres/blob/pg-pool%403.14.0/packages/pg-pool/index.js#L99
 * @quote this.options.idleTimeoutMillis = 10000
 * @verified 2026-11-16
 */
const pgPoolIdleTimeoutDefaultMs = 10_000;

/**
 * The author application's session pool: at most node-postgres's default of 10 sessions
 * ({@link pgPoolMaxDefault}), 1 kept open once opened, and the others closed after
 * node-postgres's default of 10,000 ms since their last use ({@link pgPoolIdleTimeoutDefaultMs}).
 *
 * Grizzle chooses no size and no timeout: `DbLayer.make` takes the caller's `PoolBounds`, and
 * pantry takes node-postgres's own. Pantry's calls on a `Db` run one after another: the import
 * opens one `Db` and applies one ChangeSet, the export reads its documents' pages in order, and
 * each database test file, in a worker process of its own with its own pool, imports one package at
 * a time, so the pool never needs a second session, and no measurement asks for numbers of pantry's
 * own. The session kept open serves a process's next call, such as a test file's next import
 * through the same layer, without a new connection attempt, so a process between calls holds one
 * session of the server.
 *
 * @see https://github.com/bjornpagen/grizzle/blob/eb56d58bb3191b6645f1334dc55f63c7a73c2dc4/packages/grizzle/src/adapter/types/layer.ts#L90-L108
 * @see https://github.com/bjornpagen/grizzle/blob/eb56d58bb3191b6645f1334dc55f63c7a73c2dc4/README.md#connecting
 */
const authorAppPool: PoolBounds = {
  idleTimeoutMs: pgPoolIdleTimeoutDefaultMs,
  max: pgPoolMaxDefault,
  min: 1,
};

/**
 * The author application's pool on the server its `QTI_PIE_PG_*` settings name: the login's
 * connection (`#pantry/db/connection.ts` `primedLoginConnection`), with the password of the role
 * grizzle installs for the login, its pool, and the committed served workload, read from disk and
 * served as the login's type (grizzle's `served`), with no schema module evaluated: the login's
 * type is an `import type`.
 *
 * It provides the login's `DbLayer`, for the author role, and {@link AuthorLogin}, the served login
 * itself, whose `roles.author` every `Db.open` takes: grizzle opens a `Db` only on a role of the
 * served login its layer was built over. The login serves reads, so its `DbLayer` needs its
 * installation's live source (grizzle's `LiveSource.layer`), which logs in as the decoder login the
 * served file names, with the password `scripts/db.sh migrate` gave it. It connects nothing until
 * a `Db` watches a read, which pantry never does, so that password is read at no other time.
 *
 * Building the layer fails with Effect's `ConfigError` for a missing or malformed setting, with a
 * `ClusterConfigError` (`#pantry/db/connection.ts`) when the CA is unreadable, with a
 * {@link ServedLoadError} when the served file is, with the command's `PasswordCommandError` where
 * `QTI_PIE_PG_PASSWORD_COMMAND` names one, which the build runs once for the login's role before
 * any connection attempt, and with grizzle's `OpenError` at stage `config` for a file of another
 * login. A missing password file is not found here: it fails each connection attempt with
 * grizzle's `CredentialError`.
 */
export const AuthorAppLayer = Layer.unwrap(
  Effect.gen(function* AuthorAppLayer() {
    const fs = yield* FileSystem.FileSystem;
    const connectionOf = yield* primedLoginConnection;
    const file = yield* fs.readFileString(servedPath).pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(ServedText)),
      Effect.mapError((reason) => new ServedLoadError({ path: servedPath, reason })),
    );
    const login = served<AuthorAppLogin>(file, "author_app");
    const connection = yield* connectionOf(login);
    const decoderOf = yield* loginConnection;
    const live = LiveSource.layer({ ...decoderOf(login.decoder), login });

    return Layer.merge(
      DbLayer.make({ ...connection, login, pool: authorAppPool }).pipe(Layer.provide(live)),
      Layer.succeed(AuthorLogin, login),
    );
  }),
).pipe(Layer.provide(NodeFileSystem.layer));

/**
 * Everything an import in this process runs on, one layer that needs nothing: Node's file system,
 * which the package's read (`readPackage` of `#pantry/import/read.ts`) reads the package through,
 * and {@link AuthorAppLayer}, the author login and its `DbLayer`, which its write (`importPackage`
 * of `#pantry/import/package.ts`) applies through. So
 * `importDir(dir).pipe(Effect.provide(ImportLive))` (`#pantry/test/import-dir.ts`) imports a
 * package into this package's own install, and the command line runs every command that reaches
 * the database on it (`#pantry/cli/engine.ts` `withAuthorApp`). It is the command line's and the
 * tests' own, since `package.json`'s `"exports"` map does not list this module: an application
 * builds its own author `DbLayer`, opens its `Db` and passes `db.workload` to `importPackage`.
 *
 * It is built from the process's settings, read through Effect `Config`: the cluster's
 * (`QTI_PIE_PG_HOST`, `QTI_PIE_PG_PORT`, `QTI_PIE_PG_DATABASE`, `QTI_PIE_PG_CA`,
 * `QTI_PIE_PG_SECRETS`), and it opens the committed served file. The import's `WrapApply` is a
 * reference whose default is the live one, so the layer provides none.
 * Building it fails as {@link AuthorAppLayer} fails.
 */
export const ImportLive = Layer.merge(AuthorAppLayer, NodeFileSystem.layer);

/**
 * The author role's `Db` over {@link AuthorAppLayer}: the served author login's `author` role,
 * opened with no token, the `Db` whose workload the command line imports and round-trips through
 * (`importPackage(db.workload, pkg)` of `#pantry/import/package.ts`). It is here, in the database
 * layer, so the command line opens it without reading `#pantry/db/served.ts` itself.
 *
 * `Db.open` contacts nothing of the database; it fails with grizzle's `OpenError` only where the
 * host refuses the role.
 */
export const authorDb = Effect.gen(function* authorDb() {
  return yield* Db.open((yield* AuthorLogin).roles.author, {});
});
