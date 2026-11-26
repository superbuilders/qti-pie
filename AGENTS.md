# qti-pie

qti-pie is edullm's IMS QTI 3.0.1 stack: six packages under `packages/qti-pie/packages/`. Follow edullm's root
`AGENTS.md` for everything this file does not say.

This repository is `superbuilders/qti-pie`, a git submodule of edullm at `packages/qti-pie` (and of
metis). Every qti-pie change is committed here and pushed to `main`; edullm then commits its
`packages/qti-pie` pointer. No qti-pie change is committed in edullm's own tree.

- `crust` (`@qti-pie/crust`) reads and writes XML, bytes to a tree and back. It depends only on `effect`, `saxes`,
  `arkregex` (the toolchain's one form of a regular expression, `regex()`, a typed `new RegExp` with no runtime of its
  own) and `@bjornpagen/grizzle-text`, grizzle's dependency-free, browser-safe text package, whose regex engine, text
  primitives and RFC 3986 resolution it re-exports for plate (`@qti-pie/crust/regex.ts`, `@qti-pie/crust/text.ts`,
  `@qti-pie/crust/uri.ts`), so the rest of grizzle stays out of anything that depends on it.
- `pantry` (`@qti-pie/pantry`) imports QTI 3.0.1 packages into a strict PostgreSQL model on grizzle, and exports them
  back.
- `plate` (`@qti-pie/plate`) renders QTI 3.0.1 and scores the responses. Its UI is UI SDK through React: `<Item>` from
  `@qti-pie/plate/ui` is a server component, and each interaction is a client island in `plate/src/ui/`. It depends on
  crust, never on pantry.
- `ledger` (`@qti-pie/ledger`) holds QTI's session facts as grizzle levels above pantry's: item and test sessions,
  saves, attempts, assertions and operator evaluations, delivery and test outcomes, the SQL grader, and the one item
  opening every application serves (`served-item.ts`).
- `processing` (`@qti-pie/processing`) is QTI 3.0.1 processing as one pure function: the value model, the typed
  program compiled from a stored document, every operator (the registry, Alpha's under `src/alpha/`), and response,
  outcome and template processing. It is effect-free (`toolchain.config.ts`'s `effectFree`): no Effect, Node module,
  clock, timer, ambient randomness or I/O at run time; seeds and instants are arguments, and its one grade is a
  `Graded` result only its evaluator mints. The Effect shell that reads its inputs and writes its grade lives outside it.
- `specimen` (`@qti-pie/specimen`) generates specimen items and the child's responses as data, drawn at random, in
  order or from a test's replay token, for the suites and for headless pages.

QTI comes first: the specification and its XSD defaults decide. `docs/spec-readings.md` records how the packages read
the specifications.

## Toolchain

- Effect is pinned to `4.1.4`, one copy in the workspace. plate's UI SDK (`@ui-sdk/core`, `@ui-sdk/react`) is pinned
  exactly to `0.1.0-beta.17`. Versions live in edullm's catalog.
- grizzle is this repository's submodule `vendor/grizzle`, which edullm reaches through recursion (its
  `submodule.recurse`), at its pinned commit. Move it one exact commit at a time, never
  floating, and run the whole gate on the bump before pushing it.
- After an edit, run edullm's `pnpm types`, the incremental typecheck (`pnpm types --filter './packages/qti-pie/**'`
  for qti-pie alone): each package checks its own tsconfig, as every edullm package does (crust, plate with its UI
  program, pantry, specimen with its UI program, and qti-pie's root over `tools/` and `oxlint.config.ts`), so an edit
  re-checks its package and what depends on it. Nothing gates a push: before pushing to `main`, run what the change
  needs. The whole gate is `pnpm trunk` at qti-pie's root: every package's typecheck, oxlint with qti-pie's own
  `oxlint.config.ts`, oxfmt with its `.oxfmtrc.json`, the ledger's `generate:check`, pantry's `grizzle:check`, and every
  package's tests (specimen's, its UI and Alpha suites, under the testing library's hardened flags) and the tools'
  tests at the pinned seed.

## Local database

pantry runs on the machine's one shared PostgreSQL 19 (`systemctl --user start postgres`: grizzle's pinned build on
`localhost:5432`, verify-full TLS against the CA `$PGSSLROOTCERT` names). It never starts, makes or stops a server:
never run `initdb` or `pg_ctl`. A lane takes a database of its own there and an owner role of its own, and drops both
when it is done.

Roles are the server's, unlike databases, so two lanes must never share one. The database's name is its installation's
role prefix (every role grizzle installs is `<database>__<role>`), so a lane names its database for itself
(`edullm_<lane>`, `metis_<lane>`), and its owner role sits under that prefix, `<database>_owner`. Make the owner as
`bjorn`, with a random password in a mode-600 file:

```sh
db=edullm_<lane>; secrets=~/.local/var/qti-pie/$db; mkdir -p "$secrets"; chmod 700 "$secrets"
(umask 077 && openssl rand -hex 24 > "$secrets/owner.password")
psql -h localhost -d postgres -c "CREATE ROLE ${db}_owner LOGIN CREATEDB CREATEROLE REPLICATION PASSWORD '$(cat "$secrets/owner.password")'"
```

Every setting is required, and a missing one is refused, naming it:

```sh
export QTI_PIE_PG_HOST=localhost QTI_PIE_PG_PORT=5432 QTI_PIE_PG_CA="$PGSSLROOTCERT"
export QTI_PIE_PG_DATABASE=$db QTI_PIE_PG_MIGRATION_ROLE=${db}_owner
export QTI_PIE_PG_MIGRATION_PASSWORD_FILE=$secrets/owner.password QTI_PIE_PG_TEMPLATE=template0
export QTI_PIE_PG_SECRETS=$secrets QTI_PIE_MEDIA=$secrets/media-store
```

From `packages/qti-pie/packages/pantry`:

```sh
scripts/db.sh create    # the database, from QTI_PIE_PG_TEMPLATE, owned by the owner role
scripts/db.sh migrate   # grizzle migrate, then give each login its password
scripts/db.sh reset     # grizzle uninstall (or create, where the database is missing), then migrate
scripts/db.sh drop      # grizzle uninstall, then drop the database and its password folder
scripts/db.sh check-clear  # list this installation's roles (grizzle roles) and database left on the server
```

Run `grizzle migrate` through `scripts/db.sh`, which exports the settings and the owner's password for the config's
migration connection. Login passwords live in `QTI_PIE_PG_SECRETS` (`<role>.password` in that folder);
`QTI_PIE_PG_PASSWORD_COMMAND` gives every role's password in their place. The command line's media store is the
folder `QTI_PIE_MEDIA` names. pantry's database tests run only
under a lease: `QTI_PIE_PG_DATABASE` names a migrated database and `QTI_PIE_PG_MIGRATION_PASSWORD` its
owner's password, and each file that writes runs on a copy of that database of its own
(`src/test/file-database.ts`), `${db}_<file>`, dropped when the file ends. When the lane is done,
drop any copy a killed run left first, since a copy holds grants of the installation's roles, then
`scripts/db.sh drop`, then the owner, and remove its secrets folder:

```sh
psql -h localhost -d postgres -Atc "SELECT format('DROP DATABASE %I;', datname) FROM pg_database WHERE starts_with(datname, '${db}_')" \
  | psql -h localhost -d postgres
scripts/db.sh drop
psql -h localhost -d postgres -c "DROP ROLE ${db}_owner"
```

## grizzle

Load grizzle's skill (`vendor/grizzle/packages/grizzle/skills/grizzle/SKILL.md`) before editing a schema, role, login,
workload or `grizzle.config.ts`, and before `grizzle generate` or `grizzle migrate`. Run grizzle from pantry's
directory: `pnpm grizzle <command> grizzle.config.ts`.

- The lint's `sort-keys` rule orders a relation's fields, and field order is column order: fix lint before
  `grizzle generate`, or the fix becomes an ungenerated schema change that `grizzle check` refuses.
- Read every drafted SQL file and resolve its markers; write no SQL by hand. Never edit `snapshot.json`,
  `manifest.json`, `meta.json` or a `served/*.json` file: `grizzle generate` writes them.
- grizzle refuses what its README's Limits section lists: no nullable columns, no timestamp type, no outer joins, no
  window functions, no raw SQL at run time, no JSON or XML type. Model within them.
- When grizzle behaves wrongly or a limit blocks a correct model, triage it against grizzle's source and the newest
  trunk: our misuse (fix it here), a documented limit, or a grizzle defect (its cause at `file:line` and a minimal
  reproduction that needs nothing from this repository). Record it in `docs/grizzle-findings.md` and report it to
  Bjorn. A workaround here does not close a finding.

## Code

Read `node_modules/effect/AGENTS.md` before writing Effect code, and UI SDK's docs
(`node_modules/@ui-sdk/{core,react}/docs/`) before writing UI code, using only published exports. The skills in
`.agents/skills/` apply: `effect-design`, `trace-effect`, `error-messages`, `document-code`, `conventional-commits`.

- Effect error channels; no try/catch. Generator functions passed to `Effect.gen` are named.
- Never write a core count or concurrency width as a literal: derive it from the machine (`os.availableParallelism()`,
  `nproc`, Vitest's `"100%"`).
- Each package exposes its public parts through its `"exports"` map, imports its own files through its `#<package>/*`
  alias (never relative paths), and reaches no file another package's map does not list. No package of qti-pie
  depends on pantry.
- Environment-backed settings use Effect `Config`; tests use `ConfigProvider.fromUnknown`.
- Tests sit beside the code and have an independent oracle: the specification, an exhaustive search against stated
  invariants, or a real fixture with a known answer. No style tests, markup snapshots or tests that restate the
  implementation. A database test uses a real cluster through a login's `DbLayer`, never a mock.
- plate's UI (`plate/src/ui/`) has no tests: its correctness is carried by types (Bjorn, 2026-11-15). Write none
  there, and no test support for one.
- plate's islands take serializable props built only from the redacted item, and the types hold it: an island is
  handed its payload node, its redacted model node and an `IslandContext` (`plate/src/ui/item/context.ts`) alone,
  none of which has a field for a correct response, a mapping or a template value the redaction withheld, and a
  module's `parse` reads nothing of its declaration but its type (`BoundDeclaration`), so no island's props can carry
  one, of any type. Only a review is handed the shell's server data (`InteractionContext`).

The corpus verdict file `packages/pantry/verdicts/<corpus tarball basename>.tsv` records what the importer did with
each 1EdTech example zip (`file`, `verdict`, `rule`; sorted; no 1EdTech content). Regenerate it with the corpus witness
under a lease (`QTI_PIE_CORPUS=1 QTI_PIE_PG_DATABASE=<database>`, pantry's `src/cli.corpus.db.test.ts`) and adopt the
file its failure message names.

## Schema intent

Before changing a schema, establish the domain meaning, the data to preserve and the compatibility wanted, from Bjorn's
instructions, the specification and `docs/spec-readings.md`; ask when they are unclear. No legacy repair paths,
transitional models or compatibility layers. A value that may be missing is a row of its own relation, and that
relation represents a real optional value.

## Machine resources

Leftovers are a defect: drop the databases and private clusters you made, keep downloaded inputs (specifications,
schema files, 1EdTech's examples) in `~/.cache/qti-pie/`, scratch in a package's git-ignored `work/`, never `/tmp`, and
let no process outlive its task.
