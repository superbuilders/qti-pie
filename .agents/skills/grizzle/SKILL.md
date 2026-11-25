---
name: grizzle
description: Recipes and rules for grizzle in qti-pie - the generate, review, check, migrate loop run from pantry, the files never edited by hand, and the modeling and runtime rules grizzle holds. Use before editing a grizzle schema, role, login, workload or grizzle.config.ts, before grizzle generate or migrate, and when reviewing a drafted migration or handling a grizzle error.
---

# grizzle in qti-pie

grizzle's full reference, current to the pinned commit, is its own skill and README:
`vendor/grizzle/packages/grizzle/skills/grizzle/SKILL.md`. Run `git submodule update --init` first (jj checks out
no submodule). Take every API spelling from there; this file holds the recipes and the rules.

## Where it runs

- pantry: `packages/pantry/grizzle.config.ts`, installation `Qti`, login `AuthorApp`, migrations in
  `packages/pantry/migrations/qti/`. From `packages/pantry`: `pnpm grizzle <command> grizzle.config.ts`.
- ledger: `packages/ledger/grizzle.result.config.ts` is the installation of `src/results.db.test.ts` alone, test-only
  and never deployed, so nothing commits it: the ledger's vitest global setup generates it from nothing into
  `packages/ledger/work/result-migrations/` (`pnpm run result:generate`) and installs it in the lease's result
  database, the lease's name with `_r` after it, wherever a lease is named.
- The database: AGENTS.md, "Local database". Migrate through `scripts/db.sh migrate`, which exports the settings and
  the owner's password, then gives each login its password. psql is grizzle's pinned build
  (`$GRIZZLE_PG_PREFIX/bin` from `vendor/grizzle/scripts/pg/pin.env`).

## The loop

1. Edit the schema, roles, logins and workloads. Every program the application runs is a member of its login's
   workload. Fix lint first: `sort-keys` orders a relation's fields, and field order is column order.
2. `pnpm grizzle generate grizzle.config.ts`, with `--rename <old>=<new>` or `--drop <old>` for every name the schema
   no longer holds (a relation `Task`, a field `Task.title`, a handle `Status#done`, a login `@web`). `--name` is
   lowercase words joined by `_` or `-`.
3. Read every drafted SQL file and resolve each marker:
   - `-- grizzle: placeholder`: write the value, or an UPDATE right after the file's `SET CONSTRAINTS ALL IMMEDIATE`,
     where every data step goes; delete the marker line.
   - `-- grizzle: confirm:`: keep every statement as drafted; delete the two marker lines.
   - `-- grizzle: data loss:` (a schema renamed in code): uncomment the `CREATE SCHEMA` to start it empty, or keep the
     old name and delete the folder to keep the rows.
4. qti-pie writes no other SQL by hand. grizzle accepts any SQL that ends at `snapshot.json`; name PostgreSQL types
   and functions as the drafts do (`"pg_catalog"."text"`, or a keyword like `bigint`).
5. `pnpm grizzle check grizzle.config.ts` until it prints `<schema>: ok`.
6. Commit the folder with `snapshot.json`, `manifest.json`, `served/` and `openapi/`.
7. `scripts/db.sh migrate`.

Data work the schema doesn't describe: `pnpm grizzle generate grizzle.config.ts --custom --name <name>`, add
`01-<words>.sql`…, check, commit, migrate. After a grizzle bump that changes the snapshot format, every command
refuses at stage `format`: run `grizzle upgrade grizzle.config.ts` against the live database, from the deployed
commit, with the new grizzle.

When grizzle behaves wrongly or a limit blocks a correct model, triage it as AGENTS.md says and record it in
`docs/grizzle-findings.md`. Never code around it here.

## Never edit by hand

- `snapshot.json`, `manifest.json`, `served/<login>.json`, `openapi/<login>.json`, `meta.json`: generate writes them;
  restore them from git.
- An applied migration: put new steps in a new migration.
- Transaction control (`BEGIN`, `COMMIT`, `ROLLBACK`, `END`, `ABORT`, `PREPARE TRANSACTION`). `SAVEPOINT` and
  `ROLLBACK TO` are allowed.
- The drafted violation checks (a closed rule's in Setup, a query rule's in Validate), a closed constant's hex
  literal, and `CONCURRENTLY` (a plain build blocks writes).
- `-- grizzle: no-transaction` counts only as a file's first line, and every statement of that file must be safe to
  rerun.

## Schema rules

- Every `defineConfig` key is required, as `export default defineConfig({ ... })`. grizzle reads no environment
  variable for where to connect, and no credential is written in the config: the password is an Effect read where
  the config runs (pantry's `migrationConnectionNow`).
- `schemas` lists each installation once, by its top level. Every role is in exactly one login; a login missing from
  `logins` is not installed.
- Join a library's relations to yours by concatenating lists, never by spreading records.
- A level reaches lower levels only by a containment into a key, a row check over a lower relation, or a rule over a
  query; anything else is `LevelRefused`.
- grizzle mints no ids: no `pg.serial` or `pg.uuidv7`. Key a relation by its fact's natural key, a content SHA-256, or
  an outside system's id under a contract naming that system.
- grizzle never guesses a rename and drops nothing undeclared.
- Roster handles are appended, never reordered: a code never changes meaning. A dropped handle leaves a hole; change or
  delete the rows holding it in a data step first. Ids moved to another roster are converted at a placeholder by what
  they mean, never by a cast.
- A schema renamed in code is a new, empty schema.
- generate prints why a role runs SERIALIZABLE. Clear a condition by changing the schema or the workload; there is no
  flag.
- A role that only inserts lists its entries as `insert`, not `write`. A role inserting rows that reference content
  another role maintains points its foreign keys at an insert-only published relation that a `publisher` role writes.
- A role's `write` lists only writable query entries. An entry over a family's owner filters by fields its caller
  writes, never by a count, end, index or tree start.
- Write a family's members from an array or a `Stream`, never through a query or a query entry. Delete them through
  their owner. A replace is one `delete` (or `deleteWhere`) and one `insertAll` in one stratum. Merge two array
  members of one op and one relation.
- Declared names convert to snake_case. Two names that convert alike are one name. No name starts with `_`, a
  conversion fits 63 bytes, and a schema's name does not start with `pg_`.

## Text, numbers and bytes

- Test text with grizzle's `Text.matches`, `startsWith`, `endsWith` and `contains`, never a regex or LIKE in your
  code. A pattern is a module constant `Text.pattern(source)`, never a bare string, a field or a parameter.
- Fold case with `Text.lowerAscii`, never a locale's lower. XML Schema whitespace facets use `Text.replaceWhitespace`
  and `Text.collapse`, never your own regex.
- In a query, `matches` and `translate` need a pattern that bounds the subject's length: PostgreSQL's regex engine
  widens its subject fourfold.
- Join pattern facets with `str.and(str.regex(p), str.regex(q))`, never one regex you intersect by hand.
- Regex sources use JavaScript syntax under `u` with no lookaround, `\p{…}`, `\s`, `\b`, backreference, named group,
  inline modifier, lazy quantifier or bound above 255. TypeScript accepts them; grizzle refuses them
  (`UnsupportedOperation`). Spell explicit classes.
- Fold an ordered family's texts with `Monoid.concat`, its accumulators typed by a bounded pattern.
- A set of handles has `Bits.union`, `intersection`, `difference`, `cardinality`, `subset`, `disjoint` and
  `singleton`, and no complement. Membership is `Bits.subset(Bits.singleton(id), set)`.
- A closed relation at an absent key: say what holds with `C.has(…)`, never with a null-object row.
- A partial operation needs a proof: a literal's type, a contract's `proves`, or a guard
  (`Logic.when(Num.nonzero(b), (b) => Num.div(a, b), 0n)`). Catch no 22012 or 2201F around a query, and no 22003
  except over `pg.numeric`, `exactInteger` or `exactMoney` arithmetic.
- A numeric is `pg.numeric(p, s)` or `pg.numeric`. Convert with `Num.numeric(x)`, never a cast to a typmod you don't
  mean. `exactInteger` and `exactMoney` hold exact results and are never keyed.
- Parse `xs:decimal` with `Text.parseDecimal`, and `xs:double` with `Text.parseDouble` after `Text.collapse`. Never let
  an `otherwise` stand for a value, an infinity or a sentinel: state in the rule what holds of a text that doesn't
  parse.
- A `bytes` field is written and read whole. Only `Crypto.sha256(x)` reads one: 32 raw bytes, never hex. Store the
  digest PostgreSQL computes, never one the caller sends. At most 1,073,741,819 bytes a value.
- A key's widest entry must fit PostgreSQL's 2,704-byte B-tree limit (`UnrepresentableKey`). Bound its texts with
  `str.bytes(n, …)`, or key by a declared `sha256` digest field. grizzle never digests a key for you.
- A call sends at most 1,908,342,784 bytes (`InputTooLarge`, `flight`). Split the input across calls; grizzle never
  splits it.

## Runtime and deploy

- Serve the committed workload: `served<typeof Login>(file, name)`, then `DbLayer.make`, then `Db.open` per request
  (it sends nothing), all from `@bjornpagen/grizzle/runtime`, with the login imported as a type alone. Call a member
  as `db.workload.<name>.once({ params, facts })`, `{}` where it takes none. A paged window's size is any safe integer
  of at least 1: no default, no cap.
- Handle a failure by its `CallError`'s `kind` and `retry`, reading facts from the kind's members, never from the
  message. Handle a server error by `sqlstate`, never by its words. grizzle runs no call again, and neither does
  qti-pie. After `commitUnknown`, read back before running the call again.
- A broken rule is a `refused` `CallError`. Match on its `law`, never on a constraint's name. Read a refusal by `id`,
  with ids from `lawsOf(schema)` or `lawsByStatement(schema)`, never from a list of laws you keep.
- In tests, build failures with grizzle's exported error and reason classes, never a cast or an object literal.
- Take role, schema and constraint names from `roleNameOf`, `schemaNameOf` and `constraintNamesOf`, never spelled.
  Drafted SQL names a role as `:"<stem>"` and the database as `:"DBNAME"`; write a data step the same way.
  `grizzle names` maps each hidden `__…_<digest>` object.
- Every transaction runs SERIALIZABLE, the database's default. A direct SQL writer runs
  `BEGIN ISOLATION LEVEL SERIALIZABLE`, `SET ROLE` to `roleNameOf(role, connection)`, sets claims with
  `set_config('grizzle.claims', '<json>', true)`, and states every field. A family member's direct writer fills its
  hidden columns and the owner's count and ends as grizzle would.
- A `stale` `CallError` (`Migrating`, `Migrated`) means the database holds another snapshot. Deploy the code carrying
  the new `snapshot.json` and open new `Db`s.
- `migrate` runs as the role that owns the schema and the database, and is downtime: no `Db` call runs until its last
  file commits. It refuses `PGOPTIONS` and `PGREPLICATION` in the environment.
- The server needs `max_pred_locks_per_transaction = 2048` and a lock table above the largest lock demand generate
  prints. Keep every transaction on the cluster short. No PgBouncer.
- Every server setting grizzle doesn't pin is the database owner's. A login's role holds exactly its pinned defaults;
  drift refuses any other.
