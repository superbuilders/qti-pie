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
git clone https://github.com/bjornpagen/qti-pie.git
cd qti-pie
pnpm install --frozen-lockfile
```

TypeScript runs directly on Node. There is no build step.

## Start

pantry needs a database and an owner role of its own on the machine's shared PostgreSQL 19, which `scripts/db.sh` reaches
through the `QTI_PIE_PG_*` settings, as [`AGENTS.md`](AGENTS.md#local-database) describes:

```console
$ cd packages/pantry
$ scripts/db.sh create
$ scripts/db.sh migrate
$ node src/cli.ts import ./my-package
```

`node src/cli.ts --help` lists the commands.

## Stated limits

pantry refuses valid QTI 3.0.1 content, or accepts content that is not valid, only under a stated limit. Reading 1 in
[`docs/spec-readings.md`](docs/spec-readings.md#validity) lists each limit with its cause and what would lift it. A
refusal or acceptance that reading 1 does not list is a bug.

Two known defects sit outside reading 1. Composite typing in an included rules fragment is checked in the fragment, so
the import can accept a type error in the item that places it. And pantry's randomized differential test keeps finding
outlandish packages that pantry and its reference oracle both refuse while naming different broken rules.

## Development

```bash
pnpm types         # the incremental typecheck, after every edit
pnpm check         # the full gate the push runs: format, lint and typecheck, in parallel
pnpm test          # every package's tests, the packages in parallel
pnpm format:write  # format and apply lint fixes
```

Agents and contributors start at [`AGENTS.md`](AGENTS.md).

## License

MIT. grizzle, vendored under `vendor/`, is 0BSD; see [`vendor/README.md`](vendor/README.md).
