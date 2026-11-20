# pantry

> *No mystery jars.*
>
> pantry keeps everything labeled: it stores QTI in PostgreSQL and refuses anything it can't name.

Store QTI 3.0.1 packages in a strict PostgreSQL model, and export them unchanged.

pantry imports a QTI 3.0.1 package, a directory or a `.zip` file, into a local PostgreSQL database, and exports it back
to files. It exists first to put [grizzle](../../vendor/README.md) through a large, real data model, so delivery is
out of scope. It is pre-release, and it reads XML through crust (`packages/crust`, whose source documents its reader
and writer).

## As a library

Its `package.json` exports plain grizzle values an application composes into its own grizzle config, and the steps
around them. There is no pantry runtime: the application opens its own connections and `Db`.

| Module | Values |
| --- | --- |
| `qti/schema.ts` | `Qti`, the one schema constant, every relation public and typed on `Qti.relations` |
| `qti/media.ts` | `QtiMedia`, the package-media level to stack with `schema.extend`; its policy is `MediaType` rows |
| `qti/roles.ts`, `qti/logins.ts` | `Author`, `AuthorApp`, `insertWrite`, the import's insert-only publish, and `removeWrite`, a whole package's removal |
| `import/read.ts` | `readPackage(dir, name)`: one read under the name the package is stored by, bytes to documents, files by path and referenced paths |
| `import/program.ts` | `importRowsOf`: the rows a read package is written as, for `insertWrite`, and its media files with their digests |
| `import/package.ts` | `importPackage(db.workload, pkg)`: its media put in the `MediaStore`, then `importRowsOf` applied through an author `Db`'s `insertWrite`, with retries |
| `package/media.ts` | `MediaStore`, the content-addressed store media bytes live in, and its folder and in-memory layers |
| `import/refusal.ts`, `vocab/laws.ts` | `lawNameOf`, `rulesOf` and `lawTable`: a refused law's QTI rule |
| `export/scan.ts`, `export/render.ts` | `documentScan` and `entriesOf` (grizzle queries), `documentScanOf(document)`, and `documentXml(rows)` |
| `db/install.ts` | `MediaPolicySchema`, which parses `policy.json`, `{ "media": { "<extension>": "<type>" } }` |
| `test/package-judgment.ts` | `judgePackage(dir, samples)`: the law oracle's prediction, with no database, of what the import's laws refuse in a package |

The database holds no file's bytes. A document is its tree alone, which the export writes back as canonical XML, and a
media file is its `Media` row, the SHA-256 of its bytes, which a content-addressed store holds: the application's own
(the QTI install's media CDN), which it fills before it writes the rows. An application writes its import through
`insertWrite`, in its own transaction:

```ts
const pkg = yield* readPackage(dir, "g3-science")
const { insert, media } = yield* importRowsOf(pkg)
yield* Effect.forEach(media, ({ bytes, digest }) => upload(digest, bytes))
const db = yield* Db.open(AuthorServed.roles.author, {})
const outcome = yield* db.workload.insertWrite.once({ facts: { insert }, params: {} })
```

A package is stored under the name `readPackage` is given (an NCName of at most 425 UTF-8 bytes, refused as
`BadPackageName` before anything is read), never under its manifest's identifier, which IMS Content Packaging makes
unique within one manifest alone (spec reading 178). A name is one revision for as long as it stands: a package under a
new name is `accepted`, the same package again under its name is `unchanged`, and another package under a stored name
is refused on the keys the two share. A refusal is grizzle's `refused` call error; `rulesOf(error.refused.laws)` names
its QTI rules.

Or it imports one with its media put in its `MediaStore` (`package/media.ts`), its reruns of an unanswered commit and
its named refusal, through its author `Db`'s workload, over `AuthorApp` or `MediaAuthorApp` (`qti/media.ts`) alike.
Its outcome is `accepted` or `unchanged`:

```ts
const { outcome, package: name } = yield* importPackage(db.workload, pkg)
```

An application reads a document inside its own read with `documentScanOf`, the scan `documentScan` pages, unpaged,
over a document term its attachment mints. Each row is a `ScanRow` (`export/pages.ts`):

```ts
.attach("document", (served) => documentScanOf(served.item), "array")
```

## Install

From the repository root, after the setup in [qti-pie's README](../../README.md#install):

```bash
pnpm install --frozen-lockfile
```

The database is pantry's own local cluster ([`pg.config.ts`](pg.config.ts)): grizzle's patched PostgreSQL 19rc2 on
`localhost:5447`, with verify-full TLS only, which `scripts/db.sh` and the command line make and start the first time
they need it. [`AGENTS.md`](../../AGENTS.md#local-database) describes how to build its server and how to choose another.

## Start

```console
$ cd packages/pantry
$ scripts/db.sh create
$ scripts/db.sh migrate
$ node src/cli.ts import ./my-package my-package
$ node src/cli.ts export ./out my-package
$ node src/cli.ts roundtrip ./my-package my-package
```

`import` stores the package under the name it is given, an NCName such as `my-package`, which `export` takes, and its
media files' bytes in the local media store, `QTI_PIE_MEDIA` or else `~/.local/var/qti-pie/media-store`, by their
SHA-256. A manifest's identifier is unique within its manifest alone (IMS Content Packaging 1.2, §6.11.4), so it names
no package: another package under a stored name is refused, since a name is one revision, and two packages that share a
manifest identifier are two names.

## Commands

| Command       | Writes                     | Does                                      |
| ------------- | -------------------------- | ----------------------------------------- |
| `import`      | the database, media        | Imports a package and prints its id       |
| `export`      | files                      | Writes an imported package back out       |
| `roundtrip`   | the database, media, files | Imports, exports and compares the two     |
| `schema`      | no                         | Prints the JSON Schema of `--output json` |
| `completions` | no                         | Prints a shell completion script          |

Every input is a path. Nothing is read from standard input. `--dry-run` reads and checks without writing. `export`
needs `--yes` to replace a directory that already has content. `--output json` prints one JSON value. `--help` is the reference for the flags and the exit codes.

An item ref may name an LTI link instead of an item. pantry accepts it and does not check the variable mappings or the
item-prefixed names that pass through it, because the package declares nothing the tool reports (spec reading 110).

`scripts/db.sh reset` drops the database and this package's roles, then creates and migrates again.

## Optional settings

- `QTI_PIE_PG_PASSWORD_COMMAND` names an executable that prints a role's password. Every connection attempt runs it,
  without a shell, with the role's name as its one argument, in place of `QTI_PIE_PG_MIGRATION_PASSWORD` and the logins'
  password files.

Package-media mode is no setting of pantry's: an application lists `QtiMedia` (or a level of its own over it) in its
grizzle config and writes its policy as `MediaType` rows, one per entry of its `policy.json`. Write them through a
role of their own, one that writes nothing a READ COMMITTED reader reads: the media laws read `MediaType`, so a role
that writes it beside relations a reader reads makes grizzle's certifier lift that reader to SERIALIZABLE. The database alone
judges its laws: every address a player fetches is a path to a file of the package, with an extension a `MediaType`
row lists; no address is a `data:` one; no `style` holds `url(`, `@import`, `image-set(`, `src(` or a CSS escape; no
foreign markup is kept; and every entry is used. Each media entry's `Media.digest`, the SHA-256 of its bytes that the
import states and under which it put them in the application's content-addressed store, is what such an application
serves the file by.

## Development

[`docs/spec-readings.md`](../../docs/spec-readings.md) records how the model reads QTI where it is silent or split, and
AGENTS.md's "QTI first" what decides: the spec and the XSDs. Read both before changing the model. From the repository
root:

```bash
pnpm types
pnpm --filter @qti-pie/pantry test
```

Tests that need the database use the local cluster, under a lease ([`AGENTS.md`](../../AGENTS.md#local-database)). Agents start at [`AGENTS.md`](../../AGENTS.md).

The vocabulary's derivations and the XSD differentials read the 23 XSDs that
[`src/vocab/derive/sources.ts`](src/vocab/derive/sources.ts) pins by URL and SHA-256, all published by 1EdTech under
`https://purl.imsglobal.org/spec/`. They are cached outside the repository, in `~/.cache/qti-pie/qti3/xsd/`:
`pnpm --filter @qti-pie/pantry run fetch-xsds` downloads them there and checks each digest. Without them those tests
are skipped, or fail naming that command.

## License

MIT
