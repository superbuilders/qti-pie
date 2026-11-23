/**
 * A stop by `--timeout` of an import, on the lease, held to what a fresh read of the database
 * shows.
 *
 * The test holds an import at one point of its write with a lock of its own: a trigger on
 * `qti.package`, fired by the insert of a package whose name has its prefix, waits on an advisory
 * lock the test's own session holds, either as the insert's statement runs or, deferred, at COMMIT.
 * The run's limit passes on the test clock, and only once the database shows the import's backend
 * waiting there, so the stop lands at a known point of the write; the lock is then let go, every
 * transaction the run began left to end, and the outcome the command line reported compared with
 * what a plain SQL read of `qti.package` and `qti.entry` finds. Nothing of pantry's or grizzle's
 * reads takes part in that read.
 */
import { createHash, randomUUID } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import {
  Array as Arr,
  Cause,
  Duration,
  Effect,
  Exit,
  Fiber,
  Layer,
  Option,
  Redacted,
  Schedule,
  Schema,
} from "effect";
import { TestClock } from "effect/testing";
import { Client } from "pg";
import { describe, inject } from "vitest";
import { ImportData } from "#pantry/cli/import.ts";
import { successEnvelope } from "#pantry/cli/output.ts";
import { migrationConnection } from "#pantry/db/connection.ts";
import { captureCli } from "#pantry/test/cli.ts";
import { hasLease } from "#pantry/test/settings.ts";
import { fileDatabaseOf } from "#pantry/test/writing-files.ts";

const fixtures = inject("fixtures");

/**
 * The envelope of `import`, as a reader decodes it from a line of standard output.
 */
const importEnvelope = Schema.fromJsonString(successEnvelope("import", ImportData));

/**
 * The limit of a held run. It passes on the test clock, so only when the test advances it.
 */
const heldLimit = "10 minutes";

/**
 * The key of the advisory lock the hold waits on, a number of this file's own, which no other test
 * takes.
 */
const holdClass = 20_261_114;

/**
 * The prefix of the package names the hold catches at each point: in the insert's statement, or
 * deferred to COMMIT.
 */
const holdPrefix = { commit: "stop-commit-", statement: "stop-statement-" } as const;

/**
 * The SQL that takes the hold away, the triggers and then their function, each `IF EXISTS`, so it
 * also clears a hold a crashed run left.
 */
const removeHold = [
  "DROP TRIGGER IF EXISTS pantry_cli_timeout_at_commit ON qti.package",
  "DROP TRIGGER IF EXISTS pantry_cli_timeout_at_statement ON qti.package",
  "DROP FUNCTION IF EXISTS public.pantry_cli_timeout_hold()",
] as const;

/**
 * The SQL that installs the hold: the function, which for a package whose name starts with the
 * trigger's argument names that argument, its point's prefix, as the session's `application_name`
 * ({@link heldAt} reads it) and waits on the lock {@link holdClass} names, and its two triggers,
 * one per point of {@link holdPrefix}. A constraint trigger `DEFERRABLE INITIALLY DEFERRED` fires
 * as the transaction commits, so its wait is the COMMIT's; a plain `AFTER INSERT` trigger fires in
 * the insert's statement.
 *
 * @see https://www.postgresql.org/docs/current/sql-createtrigger.html
 */
const installHold = [
  ...removeHold,
  `CREATE FUNCTION public.pantry_cli_timeout_hold() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$ BEGIN IF starts_with(NEW.package::text, TG_ARGV[0]) THEN PERFORM set_config('application_name', TG_ARGV[0], true); PERFORM pg_advisory_xact_lock(${holdClass}); END IF; RETURN NULL; END $$`,
  `CREATE CONSTRAINT TRIGGER pantry_cli_timeout_at_commit AFTER INSERT ON qti.package DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.pantry_cli_timeout_hold('${holdPrefix.commit}')`,
  `CREATE TRIGGER pantry_cli_timeout_at_statement AFTER INSERT ON qti.package FOR EACH ROW EXECUTE FUNCTION public.pantry_cli_timeout_hold('${holdPrefix.statement}')`,
] as const;

/**
 * Run one statement on the test's own session.
 *
 * @param client - The session.
 * @param text - The statement.
 * @param values - Its parameters.
 * @returns The rows it gave.
 */
const sql = (client: Client, text: string, values: readonly string[] = []) =>
  Effect.promise(() => client.query<Record<string, string>>(text, [...values])).pipe(
    Effect.map(({ rows }) => rows),
  );

/**
 * A session of the lease database as its migration identity (`migrationConnection`, the lane's
 * owner role, `QTI_PIE_PG_MIGRATION_ROLE`), which owns `qti.package`, since scripts/db.sh creates
 * the database owned by it and migrates it as it, and so may put a trigger on it, ended with the
 * scope: at the host, port and database the settings name, verifying the server against their CA.
 */
const adminSession = Effect.acquireRelease(
  Effect.gen(function* opensAdminSession() {
    const owner = yield* migrationConnection;
    const { ca, host, port } = owner.transport;
    const password = Redacted.isRedacted(owner.password)
      ? owner.password
      : yield* Effect.orDie(owner.password);
    const client = new Client({
      database: owner.database,
      host,
      password: Redacted.value(password),
      port,
      ssl: { ca: Arr.ensure(ca), servername: host },
      user: owner.role,
    });

    yield* Effect.promise(() => client.connect());

    return client;
  }),
  (client) => Effect.promise(() => client.end()),
);

/**
 * Install the hold and take its lock on the test's session, for the scope: the scope lets the lock
 * go and takes the hold away.
 *
 * @param client - The test's session.
 * @returns Completes once the hold is armed.
 */
const armHold = (client: Client) =>
  Effect.acquireRelease(
    Effect.gen(function* armsHold() {
      for (const statement of installHold) {
        yield* sql(client, statement);
      }

      yield* sql(client, `SELECT pg_advisory_lock(${holdClass})`);
    }),
    () =>
      Effect.gen(function* disarmsHold() {
        yield* sql(client, "SELECT pg_advisory_unlock_all()");

        for (const statement of removeHold) {
          yield* sql(client, statement);
        }
      }),
  );

/**
 * Let the hold's lock go, so a write waiting on it goes on.
 *
 * @param client - The test's session.
 * @returns Completes once it is let go.
 */
const releaseHold = (client: Client) =>
  Effect.asVoid(sql(client, "SELECT pg_advisory_unlock_all()"));

/**
 * How long the hold's wait lets pass between two reads of `pg_stat_activity` ({@link heldAt}).
 *
 * @limitKind provisional
 * @owner timeout.db.test.ts (heldAt, the wait for the import's backend at the hold)
 * @unit milliseconds
 * @scope each pause between two reads of `pg_stat_activity` in one held run's wait
 * @guards with no pause, the wait reads `pg_stat_activity` back to back on the test's session while the
 *   import starts, spending a CPU and the member's time until the backend arrives
 * @measure time from the run's start to the backend's arrival at the hold over many runs on the
 *   lease, and keep the longest pause that adds no more than a tenth of that to the wait
 * @origin written with no evidence with the hold's wait, which polled once every 100 ms
 * @recorded 2026-11-21
 */
const holdReadPauseMillis = 100;

/**
 * Wait, on the live clock, until a backend of the file's own database waits on the hold's lock, and
 * say where it waits: the hold names its point as the backend's `application_name`, which
 * `pg_stat_activity` shows every role, unlike a backend's wait and statement, which it shows only
 * to the backend's own role and `pg_read_all_stats`, and `pg_blocking_pids` names the test's
 * session, the lock's holder, as what the backend waits for. It never reads `pg_locks`: that view
 * snapshots every predicate lock slot of the server, which on the shared server passes PostgreSQL's
 * 1 GB allocation ("invalid memory alloc request size"). A run that ends first fails the wait with
 * how it ended. It reads again after a pause ({@link holdReadPauseMillis}) until it finds the
 * waiter: PostgreSQL offers no blocking wait for another session to begin waiting, since a lock
 * request blocks only until a holder lets go, so no read of the test's session can block until the
 * import arrives. The suite's `testTimeout` bounds the wait; it has no limit of its own.
 *
 * @param client - The test's session.
 * @param run - The run of the command line being held.
 * @returns Where the waiting backend is: `commit` while it runs COMMIT, else `statement`.
 */
const heldAt = (client: Client, run: Fiber.Fiber<{ readonly stderr: string }, unknown>) =>
  TestClock.withLive(
    Effect.gen(function* findsWaiter() {
      const ended = run.pollUnsafe();

      if (ended !== undefined) {
        return yield* Effect.die(
          new Error(
            `The import ended before the hold caught it, so the stop was not placed: ${Exit.isSuccess(ended) ? ended.value.stderr : Cause.pretty(ended.cause)}`,
          ),
        );
      }

      const waiting = yield* sql(
        client,
        "SELECT application_name AS point FROM pg_stat_activity WHERE datname = current_database() AND application_name IN ($1, $2) AND pg_backend_pid() = ANY (pg_blocking_pids(pid))",
        [holdPrefix.commit, holdPrefix.statement],
      );
      const point = yield* Effect.fromOption(Option.fromNullishOr(waiting[0]?.["point"]));

      return point === holdPrefix.commit ? "commit" : "statement";
    }).pipe(Effect.retry(Schedule.spaced(Duration.millis(holdReadPauseMillis)))),
  );

/**
 * Wait until every transaction the run began has committed or rolled back, so the database is read
 * as the run left it: each of them writes `qti.package` and holds its ROW EXCLUSIVE lock from that
 * insert until it ends, and a SHARE lock conflicts with it (PostgreSQL's table-level lock modes),
 * so taking one blocks until the last of them ends, and it is let go at once. The run has ended
 * before this wait, so none of its writes begins after it.
 *
 * @param client - The test's session.
 * @returns Completes once no transaction of the run is open.
 */
const quiesced = (client: Client) =>
  Effect.asVoid(sql(client, "BEGIN; LOCK TABLE qti.package IN SHARE MODE; COMMIT"));

/**
 * One media file of a package: its path and the SHA-256 of its bytes in lowercase hex.
 */
interface MediaFile {
  readonly digest: string;
  readonly path: string;
}

/**
 * What a package holds, as the test compares it: the path of every entry, sorted by UTF-16 code
 * unit, and the digest of each media entry by its path.
 */
interface Held {
  readonly media: ReadonlyMap<string, string>;
  readonly paths: readonly string[];
}

/**
 * What a plain SQL read finds stored under `name`: none where `qti.package` has no row of it, else
 * the path of every entry `qti.entry` holds for it and the digest `qti.media` states for each media
 * entry, its 32 octets written in lowercase hex to compare with Node's.
 *
 * @param client - The test's session.
 * @param name - The package's name.
 * @returns What is stored, or none.
 */
const storedUnder = Effect.fn("test.timeout.storedUnder")(function* storedUnder(
  client: Client,
  name: string,
) {
  if (
    (yield* sql(client, "SELECT package FROM qti.package WHERE package = $1", [name])).length === 0
  ) {
    return Option.none();
  }

  const entries = yield* sql(client, "SELECT path FROM qti.entry WHERE package = $1", [name]);
  const media = yield* sql(
    client,
    "SELECT path, encode(digest, 'hex') AS digest FROM qti.media WHERE package = $1",
    [name],
  );

  return Option.some<Held>({
    media: new Map(media.map((row) => [row["path"] ?? "", row["digest"] ?? ""] as const)),
    paths: entries.map((row) => row["path"] ?? "").toSorted(),
  });
});

/**
 * The files of the package folder `dir`: every regular file under it, by its path relative to
 * `dir`, with Node's SHA-256 of its bytes.
 *
 * @param dir - The package folder.
 * @returns Its files.
 */
const folderFiles = (dir: string): readonly MediaFile[] =>
  readdirSync(dir, { encoding: "utf-8", recursive: true })
    .filter((file) => lstatSync(path.join(dir, file)).isFile())
    .map((file) => ({
      digest: createHash("sha256")
        .update(readFileSync(path.join(dir, file)))
        .digest("hex"),
      path: file.split(path.sep).join("/"),
    }));

/**
 * What a package folder holds once imported whole: an entry for every file, and, for each file
 * `media` names, its digest.
 *
 * @param dir - The package folder.
 * @param media - The paths of its media files.
 * @returns What it holds.
 */
const folderHeld = (dir: string, media: ReadonlySet<string>): Held => {
  const files = folderFiles(dir);

  return {
    media: new Map(
      files.flatMap(({ digest, path: at }) => (media.has(at) ? [[at, digest] as const] : [])),
    ),
    paths: files.map(({ path: at }) => at).toSorted(),
  };
};

/**
 * A package name of this run's own under `prefix`, so no stored package of an earlier run has it.
 *
 * @param prefix - The prefix.
 * @returns The name.
 */
const freshName = (prefix: string): string => `${prefix}${randomUUID().replaceAll("-", "")}`;

/**
 * The failure a run ended with, as the program squashes it.
 *
 * @param exit - How the run ended.
 * @returns What it failed with, none where it succeeded.
 */
const failureOf = (exit: Exit.Exit<unknown, unknown>): Option.Option<unknown> =>
  Exit.isFailure(exit) ? Option.some(Cause.squash(exit.cause)) : Option.none();

describe.skipIf(!hasLease)("timeout.db.test.ts, on the lease", () => {
  layer(NodeServices.layer.pipe(Layer.provideMerge(fileDatabaseOf("timeout"))), {
    timeout: "120 seconds",
  })("a stop by --timeout", (it) => {
    it.effect(
      "at COMMIT, once every statement of the import has run, reports the import the database shows committed",
      () =>
        // Oracle: a plain SQL read after every transaction the run began has ended, of
        // `qti.package`, `qti.entry` and `qti.media`, against the fixture's folder: an entry for
        // every file, and for its one media file, `images/sign.png`, the digest Node's SHA-256
        // gives its bytes. The stop lands
        // while COMMIT waits on the hold, which a deferred constraint trigger places in COMMIT
        // (PostgreSQL's CREATE TRIGGER), and grizzle's flight awaits COMMIT's answer before the
        // interruption takes effect, so the commit is decided when the run settles.
        Effect.scoped(
          Effect.gen(function* stopAtCommit() {
            const client = yield* adminSession;
            const name = freshName(holdPrefix.commit);

            yield* armHold(client);

            const run = yield* Effect.forkChild(
              captureCli(["--json", "--timeout", heldLimit, "import", fixtures.simple, name]),
            );

            assert.strictEqual(yield* heldAt(client, run), "commit");

            yield* TestClock.adjust(heldLimit);
            // The limit has passed: let the interruption reach the flight that awaits COMMIT.
            yield* TestClock.withLive(Effect.sleep("1 second"));
            yield* releaseHold(client);

            const { exit, stderr, stdout } = yield* Fiber.join(run);

            yield* quiesced(client);

            const stored = yield* storedUnder(client, name);

            assert.isTrue(Exit.isSuccess(exit), stderr);
            assert.include(stderr, "once its write had begun");
            assert.deepStrictEqual(Schema.decodeUnknownSync(importEnvelope)(stdout).data, {
              outcome: "accepted",
              package: name,
            });
            assert.deepStrictEqual(
              stored,
              Option.some(folderHeld(fixtures.simple, new Set(["images/sign.png"]))),
            );
          }),
        ),
    );

    it.effect(
      "in the insert's statement, before COMMIT, reports nothing written, which the database shows",
      () =>
        // Oracle: the same plain SQL read, after the hold's lock is let go and every transaction
        // the run began has ended, so a write the stop did not cancel would have committed by then
        // and be found.
        Effect.scoped(
          Effect.gen(function* stopInStatement() {
            const client = yield* adminSession;
            const name = freshName(holdPrefix.statement);

            yield* armHold(client);

            const run = yield* Effect.forkChild(
              captureCli(["--json", "--timeout", heldLimit, "import", fixtures.simple, name]),
            );

            assert.strictEqual(yield* heldAt(client, run), "statement");

            yield* TestClock.adjust(heldLimit);

            const { exit, stderr } = yield* Fiber.join(run);

            yield* releaseHold(client);
            yield* quiesced(client);

            const stored = yield* storedUnder(client, name);

            assert.deepInclude(
              Option.getOrUndefined(failureOf(exit)),
              {
                _tag: "WriteStopped",
                command: "import",
                held: "absent",
                package: name,
              },
              stderr,
            );
            assert.deepStrictEqual(stored, Option.none());
          }),
        ),
    );

    it.effect("before the write begins is a plain timeout, and nothing is stored", () =>
      // Oracle: the same plain SQL read. A limit of one millisecond on the live clock passes
      // while the run still loads the author login's served file, long before its first
      // statement.
      Effect.scoped(
        Effect.gen(function* stopBeforeWrite() {
          const client = yield* adminSession;
          const name = freshName("stop-before-");
          const { exit, stderr } = yield* TestClock.withLive(
            captureCli(["--json", "--timeout", "1 millis", "import", fixtures.simple, name]),
          );

          yield* quiesced(client);

          assert.deepInclude(
            Option.getOrUndefined(failureOf(exit)),
            {
              _tag: "CommandTimedOut",
            },
            stderr,
          );
          assert.deepStrictEqual(yield* storedUnder(client, name), Option.none());
        }),
      ),
    );
  });
});
