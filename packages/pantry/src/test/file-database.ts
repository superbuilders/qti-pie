/**
 * A database of one test file's own: the lane's database, the one `QTI_PIE_PG_DATABASE` names,
 * copied whole (`CREATE DATABASE … TEMPLATE`), its schemas, rows and grants, under the lane's
 * roles. vitest runs a package's database files side by side, and grizzle runs no call again, so
 * each file that writes takes a copy of its own, and a transient refusal is a finding of the file's
 * own writes, never another file's. The lane's migration identity copies and drops them, so it
 * needs CREATEDB and to own the lane's database. While files copy it, no session holds the lane's
 * database: a template is copied only while no session holds it, and copies of one template run
 * side by side.
 *
 * The one implementation for pantry's suites and the QTI database's: each package names its own
 * writing files, a closed union of suffixes of at most 18 bytes, so a copy's name, the lane's (at
 * most 43 bytes), `_` and the suffix, stays within PostgreSQL's 63.
 *
 * @module
 */
import { Array as Arr, Effect, Layer, Option, Redacted, Schema } from "effect";
import { Client } from "pg";
import {
  DatabaseName,
  FileDatabase,
  clusterDatabase,
  loginConnection,
  migrationConnection,
  roleConnections,
} from "#pantry/db/connection.ts";

/**
 * PostgreSQL's maintenance database, which initdb makes on every server: where a file's database is
 * copied and dropped, since a template is copied only while no session holds it.
 */
const maintenanceDatabase = "postgres";

/**
 * A statement the migration identity ran on the maintenance database that PostgreSQL refused; its
 * `cause` is the driver's error, which a reporter prints beside the message.
 */
export class FileDatabaseRefused extends Schema.TaggedError<FileDatabaseRefused>()(
  "FileDatabaseRefused",
  { cause: Schema.Unknown, statement: Schema.String },
) {
  /**
   * The statement, and what the migration identity needs.
   */
  override get message(): string {
    return `PostgreSQL refused ${this.statement} for the lane's migration identity, which needs CREATEDB and to own the lane's database`;
  }
}

/**
 * A client of a database as the lane's migration identity, which owns every schema the lane's
 * installation holds: verify-full TLS to the server's host against its CA, the role and the
 * password the migration connection reads. The caller connects it and ends it.
 *
 * @param database - The database it connects to.
 * @returns The client, not yet connected.
 */
export const migrationClientOf = (database: string) =>
  Effect.gen(function* migrationClientAt() {
    const connection = yield* migrationConnection;
    const { ca, host, port, servername } = connection.transport;
    const password = Redacted.isRedacted(connection.password)
      ? connection.password
      : yield* connection.password;

    return new Client({
      database,
      host,
      password: Redacted.value(password),
      port,
      ssl: { ca: Arr.ensure(ca), servername },
      user: connection.role,
    });
  });

/**
 * One statement on the maintenance database, as the lane's migration identity
 * ({@link migrationClientOf}), on a session of its own.
 *
 * @param statement - The statement.
 * @returns Completes once it has run; fails with {@link FileDatabaseRefused}.
 */
const onMaintenance = (statement: string) =>
  Effect.acquireUseRelease(
    migrationClientOf(maintenanceDatabase).pipe(
      Effect.tap((client) =>
        Effect.tryPromise({
          catch: (cause) => FileDatabaseRefused.make({ cause, statement: "connect" }),
          try: () => client.connect(),
        }),
      ),
    ),
    (client) =>
      Effect.tryPromise({
        catch: (cause) => FileDatabaseRefused.make({ cause, statement }),
        try: () => client.query(statement),
      }),
    (client) => Effect.promise(() => client.end()),
  );

/**
 * A database of one test file's own, `<lane>_<file>`, which the scope drops when it closes; one a
 * killed run left is dropped first.
 *
 * The copy is `STRATEGY FILE_COPY`, the template's files copied whole, never `WAL_LOG`,
 * PostgreSQL's default since 15, which writes the template block by block through the WAL: a copy
 * measured 0.4 s that way against 94 to 138 s by default. A file copy checkpoints, which a test
 * server's durability (no fsync) makes cheap.
 *
 * The drop is `WITH (FORCE)`. The file's layers are released before this scope closes, but a
 * DbLayer's release (grizzle's pool end) returns once the client's sockets close, not once the
 * server's backends have exited: each backend exits after its client is gone, and PostgreSQL gives
 * no event for that exit, so a plain drop, which waits 5 s for other sessions and then refuses with
 * 55006, races it, and a backend's exit outlasts the wait on a loaded server (FORM-AUDIO's t4941,
 * 2026-11-28, at 70% memory pressure). A forced drop terminates any backend still in the database,
 * so it holds with no clock, as `scripts/db.sh` and the ledger's result install drop theirs. A
 * layer whose pool was never ended has its sessions terminated with the database, and its next
 * statement fails naming the termination; grizzle gives the client no proof that a pool ended, so
 * one never used again is not seen here.
 *
 * @param file - The file, which names its database: a member of its package's closed union of
 *   writing files, at most 18 bytes.
 * @returns The database's name; a name past the database-name rule (63 bytes) fails as Effect's
 *   `SchemaError` before anything is copied.
 */
export const fileDatabase = (file: string) =>
  Effect.gen(function* fileDatabaseOf() {
    const lane = yield* clusterDatabase;
    const database = yield* Schema.decodeUnknownEffect(DatabaseName)(`${lane}_${file}`);

    const drop = onMaintenance(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);

    yield* drop;
    yield* Effect.acquireRelease(
      onMaintenance(`CREATE DATABASE "${database}" TEMPLATE "${lane}" STRATEGY FILE_COPY`),
      () => Effect.orDie(drop),
    );

    return database;
  });

/**
 * A test file's database ({@link fileDatabase}) for every connection pantry builds in the layer's
 * scope ({@link FileDatabase}): a layer, a command line run in the test's process and a session the
 * test opens all reach it. Provide it with `Layer.provideMerge`, so the file's own effects read it
 * too; the copy is dropped when the layer's scope closes.
 *
 * @param file - The file, which names its database.
 * @returns The layer.
 */
export const fileDatabaseLayer = (file: string) =>
  Layer.unwrap(
    Effect.map(fileDatabase(file), (database) =>
      Layer.succeed(FileDatabase, Option.some(database)),
    ),
  );

/**
 * A test file's database ({@link fileDatabase}), and the connection each of its roles and logins
 * makes to it, the lane's role prefix their installation's: for a suite that builds its own
 * layers from connections, as the QTI database's do.
 *
 * @param file - The file, which names its database.
 * @returns The database, the lane's role prefix, and the connection builders.
 */
export const fileConnections = (file: string) =>
  Effect.gen(function* fileConnectionsOf() {
    const rolePrefix = yield* clusterDatabase;
    const database = yield* fileDatabase(file);
    const atFile = Effect.provideService(FileDatabase, Option.some(database));
    const { connectionAs } = yield* atFile(roleConnections);
    const loginConnectionOf = yield* atFile(loginConnection);

    return { connectionAs, database, loginConnectionOf, rolePrefix };
  });
