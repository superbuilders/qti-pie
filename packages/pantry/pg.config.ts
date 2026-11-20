import { pin } from "@bjornpagen/grizzle-pg/pin";
import { localCluster } from "@bjornpagen/testing/pg";

/**
 * The sessions one worker of pantry's database tests holds on the member at once: its test file's
 * author layer's, and the one of a command line it runs (`captureCli` in the worker, `spawnCli` in
 * a child), or that run's and `timeout.db.test.ts`'s own session as the owner. Each author layer
 * holds one session at a time, since pantry's calls on a `Db` run one after another
 * (`authorAppPool`, src/db/layer.ts), and no test file opens more than two of these at once.
 *
 * @limitKind derived
 * @owner pantry's local cluster (pg.config.ts)
 * @unit connections
 * @scope the client backends one worker of the `database` Vitest project (vite.config.ts) holds on
 *   the member at once
 * @derivation a file's layer and a command line it runs, each one session (authorAppPool), or a
 *   command line and timeout.db.test.ts's owner session; no file opens a third at once
 * @from authorAppPool in src/db/layer.ts, and the database test files' layers and runs
 */
const connectionsPerWorker = 2;

/**
 * The sessions on the member outside any test worker, one each: scripts/db.sh's, which runs one
 * psql or one grizzle command at a time, grizzle migrate holding one session for its whole apply; a
 * person's command line, one session (`authorAppPool`); and an operator's psql.
 */
const outsideSessions = [
  "scripts/db.sh's",
  "a person's command line",
  "an operator's psql",
] as const;

/**
 * Pantry's own local cluster, which scripts/db.sh and the command line reach with nothing
 * configured, made by the testing library's one cluster maker: on port 5447, run by grizzle's
 * pinned PostgreSQL build (`${pin.GRIZZLE_PG_PREFIX}/bin`, which grizzle's `pnpm pg:build` makes),
 * owned by qti_pie_dev, which owns every database scripts/db.sh creates there and runs its
 * migrations, each database made from the template qti_pie_template, which carries no extension
 * since the schema uses none. Kept, not throwaway: it holds the packages imported into it, so the
 * library never resets, destroys or makes it again, and fsync stays on. One member, its
 * connections sized for its database tests' workers and the sessions outside them, the rest at
 * PostgreSQL's defaults. scripts/db.sh and the command line make and start it the first time
 * either needs it; `pnpm exec toolchain-pg <command>` from this directory runs its life by hand,
 * and TOOLCHAIN_PG_CLUSTER names a private cluster of the same spec.
 */
export default localCluster({
  bin: { directory: `${pin.GRIZZLE_PG_PREFIX}/bin`, kind: "directory" },
  durability: "kept",
  extensions: [],
  owner: "qti_pie_dev",
  ownerParameters: [],
  peerLogins: [],
  port: 5447,
  sizing: {
    connections: {
      outside: outsideSessions.length,
      perWorker: connectionsPerWorker,
    },
    family: { kind: "one" },
    kind: "leased",
    replication: { kind: "default" },
    sharedBuffers: { kind: "default" },
  },
  template: "qti_pie_template",
});
