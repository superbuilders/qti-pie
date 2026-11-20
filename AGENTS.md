# qti-pie

qti-pie is edullm's IMS QTI 3.0.1 stack: three packages under `packages/qti-pie/packages/`. Follow edullm's root
`AGENTS.md` for everything this file does not say.

This repository is `superbuilders/qti-pie`, a git submodule of edullm at `packages/qti-pie` (and of
alphatest-novus). Every qti-pie change is committed here and pushed to `main`; edullm then commits its
`packages/qti-pie` pointer. No qti-pie change is committed in edullm's own tree.

- `crust` (`@qti-pie/crust`) reads and writes XML, bytes to a tree and back. It depends only on `effect`, `saxes` and
  `@bjornpagen/grizzle-text`, grizzle's dependency-free, browser-safe text package, whose RFC 3986 resolution it
  re-exports for plate (`@qti-pie/crust/uri.ts` `resolveWithin`), so the rest of grizzle stays out of anything that
  depends on it.
- `pantry` (`@qti-pie/pantry`) imports QTI 3.0.1 packages into a strict PostgreSQL model on grizzle, and exports them
  back.
- `plate` (`@qti-pie/plate`) renders QTI 3.0.1 and scores the responses. Its UI is UI SDK through React: `<Item>` from
  `@qti-pie/plate/ui` is a server component, and each interaction is a client island in `plate/src/ui/`. It depends on
  crust, never on pantry.

QTI comes first: the specification and its XSD defaults decide. `docs/spec-readings.md` records how the packages read
the specifications.

## Toolchain

- Effect is pinned to `4.1.4`, one copy in the workspace. plate's UI SDK (`@ui-sdk/core`, `@ui-sdk/react`) is pinned
  exactly to `0.1.0-beta.10`. Versions live in edullm's catalog.
- grizzle is this repository's submodule `vendor/grizzle`, which edullm reaches through recursion (its
  `submodule.recurse`), at its pinned commit. Move it one exact commit at a time, never
  floating, with the full checks.
- After an edit, run edullm's `pnpm types`, the incremental typecheck (`pnpm types --filter './packages/qti-pie/**'`
  for qti-pie alone): each package checks its own tsconfig, as every edullm package does (crust, plate with its UI
  program, pantry, specimen with its UI program, and qti-pie's root over `tools/` and `oxlint.config.ts`), so an edit
  re-checks its package and what depends on it. The push runs edullm's full gate, `pnpm check`: format, lint and
  typecheck (each package's `typecheck`, `qti-pie#oxlint`, and the root's format), with qti-pie's own
  `oxlint.config.ts` and `.oxfmtrc.json`. Tests run in edullm's `pnpm test`.

## Local database

pantry runs on its own local cluster, `packages/pantry/pg.config.ts`: grizzle's patched PostgreSQL 19 build (`pnpm
pg:build` in the grizzle checkout makes it), on `localhost:5447`, verify-full TLS only, owned by `qti_pie_dev`, made by
the testing library's cluster maker. `scripts/db.sh` and the command line make and start it the first time they need
it; `pnpm exec toolchain-pg <command>` from `packages/qti-pie/packages/pantry` runs its life by hand (`status`, `start`,
`stop`, `doctor`, `psql`, `env`), and `TOOLCHAIN_PG_CLUSTER=<port>` names a private cluster of the same spec for every
command and test. Never run `initdb` by hand. From `packages/qti-pie/packages/pantry`:

```sh
scripts/db.sh create    # database qti_pie from the cluster's template, owned by qti_pie_dev
scripts/db.sh migrate   # grizzle migrate, then give each login its local password
scripts/db.sh reset     # grizzle uninstall (or create, where the database is missing), then migrate
scripts/db.sh drop      # grizzle uninstall, then drop the database and its password folder
scripts/db.sh check-clear  # list this installation's roles (grizzle roles) and database left on the cluster
```

`scripts/db.sh` reads each `QTI_PIE_PG_*` setting left unset (the port, `QTI_PIE_PG_CA`, the migration role, the
template and the owner's password file) from the cluster, once, through `toolchain-pg env`, and the command line its
port and CA from the cluster maker; setting them reaches another server. Run `grizzle migrate` through `scripts/db.sh`:
the config's migration connection reads the CA from `QTI_PIE_PG_CA` alone, which the script sets. Login passwords live
in `~/.local/var/qti-pie/<database>/<role>.password`. Each database is its own installation: its `rolePrefix` is its
name, so two databases hold the Qti schema at once without sharing a role. pantry's database tests run only under a
lease: `QTI_PIE_PG_DATABASE=<database>` names a migrated database. Drop a database you made when you are done with it.

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
