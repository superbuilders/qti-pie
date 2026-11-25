# qti-pie

> *Easy as pie.*
>
> QTI isn't. qti-pie does the hard part: crust reads it, pantry keeps it, plate serves it.

A pnpm workspace for working with IMS QTI 3.0.1 assessments.

It reads QTI XML, stores QTI 3.0.1 packages in PostgreSQL and exports them back, and renders QTI 3.0.1. It runs on one
machine and has no deploy target. The code is pre-release, and nothing here is published to npm.

| Package                     | Does                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| [`crust`](packages/crust)   | Reads and writes XML, bytes to a tree and back.                          |
| [`pantry`](packages/pantry) | Imports QTI 3.0.1 packages into a strict PostgreSQL model, exports them. |
| [`plate`](packages/plate)   | Renders QTI 3.0.1.                                                       |

## Install

Requires Node 26 or later, pnpm and [Git LFS](https://git-lfs.com). Install Git LFS before cloning, or the migration
snapshots check out as pointer files.

```bash
git clone --recurse-submodules https://github.com/superbuilders/qti-pie.git
cd qti-pie
pnpm install --frozen-lockfile
```

TypeScript runs directly on Node. There is no build step. Two submodules join the workspace and run from source:
`vendor/grizzle` (the schema compiler pantry's and the ledger's levels are written in) and `vendor/toolchain` (the dev
tools and the testing library), the latter at the one toolchain commit qti-pie's consumers and grizzle pin.

### Installing qti-pie by itself, and inside a consumer

qti-pie is also a submodule of edullm and of metis. Inside a consumer, the consumer's `pnpm-workspace.yaml` is the
workspace and its catalog gives every version; qti-pie's own `pnpm-workspace.yaml`, catalog and `pnpm-lock.yaml` play no
part there, as grizzle's do inside qti-pie. They are read only when qti-pie is installed by itself: in its own checkout,
and in trunk@qti-pie's worktree, whose gate is `pnpm run trunk`.

So qti-pie's catalog is a second copy of its consumers' entries for the 24 packages its workspace names by `catalog:`,
and no check holds the two equal: the toolchain's workspace gate reads one workspace at a time. The risk is drift, a
version qti-pie's gate proves that its consumers do not run. Keep them equal by hand: a change to one of those entries in
a consumer's catalog is made here in the same change, and a bump here only follows the consumers'. grizzle carries the
same arrangement inside qti-pie, with the same risk. `vendor/toolchain` and grizzle's own `vendor/toolchain` stay at the
consumers' toolchain commit, which the consumers' `toolchain-pin:check` holds.

## Start

pantry needs a database and an owner role of its own on the machine's shared PostgreSQL 19, which `scripts/db.sh` reaches
through the `QTI_PIE_PG_*` settings, as [`AGENTS.md`](AGENTS.md#local-database) describes:

```console
$ cd packages/pantry
$ scripts/db.sh create
$ scripts/db.sh migrate
$ node src/qti-import.ts ./my-package my-package
```

`node src/cli.ts --help` lists the commands, each a program of its own (`src/qti-import.ts`, `src/qti-export.ts`,
`src/qti-roundtrip.ts`).

## Stated limits

pantry refuses valid QTI 3.0.1 content, or accepts content that is not valid, only under a stated limit. Reading 1 in
[`docs/spec-readings.md`](docs/spec-readings.md#validity) lists each limit with its cause and what would lift it. A
refusal or acceptance that reading 1 does not list is a bug.

Two known defects sit outside reading 1. Composite typing in an included rules fragment is checked in the fragment, so
the import can accept a type error in the item that places it. And pantry's randomized differential test keeps finding
outlandish packages that pantry and its reference oracle both refuse while naming different broken rules.

## Development

```bash
pnpm -r run typecheck   # every package's typecheck
pnpm run oxlint         # type-aware lint of the repository
pnpm run trunk          # the whole gate trunk@qti-pie runs: typecheck, lint, format, generated files, pantry's
                        # grizzle check and every package's tests
```

Agents and contributors start at [`AGENTS.md`](AGENTS.md).

## License

MIT. grizzle, vendored under `vendor/`, is 0BSD; see [`vendor/README.md`](vendor/README.md).
