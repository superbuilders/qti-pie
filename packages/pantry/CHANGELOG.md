# Changelog

## Unreleased: the operator and usage copies are views

- `RoundingModeFigures` and `ToleranceToken` (`qti/overlay-queries/expression.ts`) and `UsageValueBaseType`
  (`qti/queries.ts`) are derived relations over `Attribute` and `Node`: no import writes them. `Rounding`,
  `RoundingHolds`, `RoundingFigures`, `Tolerance` (`qti/operators.ts`) and `UsageValue` (`qti/metadata.ts`) are
  removed, with the statements of "E1 derived" that held their copies. A rounding operator's `figures` or a tolerance
  value past `matchedTextBytes` is refused under "Rounding figures" or "Equal tolerance". The three are plain derived
  relations: a check over a stored one that reads a pattern does not compile at the pin (`docs/grizzle-findings.md`).

## Unreleased: no --timeout

- The command line has no `--timeout` and reads no `QTI_TIMEOUT`: a command runs until it ends or its operator stops
  it. The error kind `timeout` and the errors `CommandTimedOut`, `WriteStopped` and `WriteUnsettled` are removed.
- An export dies on rows the laws exclude: `DocumentRowCount` (`export/pages.ts`) is removed, `assembleScan` and
  `readDocument` (`model/assemble.ts`) return the document, and `exportEntries`, `exportPackage` and `documentXml`
  fail with no `AssembleError` or crust `EncodeError`.
- `QTI_PIE_MEDIA` (the command line's media store, `localMediaStore` of `package/media.ts`), `QTI_PIE_PG_SECRETS`
  (the logins' password folder, where no `QTI_PIE_PG_PASSWORD_COMMAND` is set) and `HOME` (the home folder no export
  replaces) are required, each with no default. A consumer of `localMediaStore` sets `QTI_PIE_MEDIA` itself, as
  metis's content admission (`packages/content-admission/scripts/admit.ts`) must, and so does an operator who runs
  pantry's command line through edullm's `pnpm db qti <command>`.

## Unreleased: the mapping, catalog and table copies are views

The importer writes no copy of an attribute a view reads. Breaking changes:

- `MapKey` and `LookupValue` (`qti/mapping.ts`), `CatalogId`, `HeaderToken` and `CellTable` (`qti/names.ts`),
  `AssembledCatalog` (`qti/overlay-queries/catalog.ts`) and `TableHeader` (`qti/overlay-queries/html.ts`) are stored
  derived relations, which grizzle keeps equal to their definitions over `Attribute`, `Node` and `PlacedId`: no import
  writes them, and the author role reads each whole. `CellHeaders` and `TableScope` are removed; a cell's table is
  `CellTable`'s, and a `th` no `table` holds has no `TableHeader`.
- The law "Mapping overlay" is removed, with the statements of "E1 derived" that held those copies to their sources.
  A map key or a lookup value is held to no byte bound; one past `matchedTextBytes` is refused under "Typed attribute
  value" where its declaration has a base type.

## Unreleased: one spelling of unchanged

- `importPackage`'s outcome (`import/package.ts` `Imported`) and `--output json`'s `outcome` (`schema/import.json`) say
  `unchanged`, grizzle's own name for a write that finds its package stored, in place of `no-change`. `qti import`
  still prints `unchanged`.

## Unreleased: no document store

The database holds no file's bytes: a document is its tree alone, and a media file the SHA-256 of its bytes, which a
content-addressed store holds. A package's name is one revision. Breaking changes:

- `Entry` (`qti/package.ts`) loses `content` and `digest` and gains `kind`, `EntryKind`'s `document` or `media`. A new
  relation, `Media`, holds each media entry's `digest`, which the importer states, and the law "Entry kind"
  (`alternatives`) holds every entry to exactly one `Document` or `Media` row, in place of "Document entry"'s
  `Document` ⊆ `Entry`.
- `importWrite` (`qti/logins.ts`) is removed. `AuthorApp`'s and `MediaAuthorApp`'s workloads serve `insertWrite`
  alone: a package is closed, never changed or removed. Another package under a stored name is refused.
- `importRowsOf` (`import/program.ts`) answers `media` beside `insert`: each media file's path, bytes and digest,
  which the writer puts in its store before it writes the rows.
- `importPackage` (`import/package.ts`) takes its workload's `insertWrite` alone and needs a `MediaStore`
  (`package/media.ts`). It applies its write once: a commit with no answer fails it with grizzle's `commitUnknown`,
  and importing the package again answers `unchanged` where it committed, so `CommitUnresolved`,
  `settleCommitUnknown`, `holdsPackage` and `EntryDigest` are removed.
- `exportEntries` and `exportPackage` (`export/package.ts`) read each media file from the `MediaStore` by its digest;
  `compareExported` and `compareWithRecord` are removed, and `compareRecord` (`export/compare.ts`) is
  `compareSource`, the package the import read against the export.
- The command line puts media in a folder, `QTI_PIE_MEDIA`, else `~/.local/var/qti-pie/media-store`.

## Unreleased: just grizzle

pantry's API is plain grizzle values. Breaking changes:

- `Qti` is one schema constant (`qti/schema.ts`). `qtiSchema(policy)` and `qtiLevelsOf(policy)` take no policy: a
  call with `Option.some(policy)` is a type error. `QtiSchema`, `authorAppOf`, `authorRoleOf`, `authorWorkloadsOf`
  and `exportQueriesOf` stay callable and return `Qti`'s one value.
- The package-media laws are a level, `QtiMedia` (`qti/media.ts`), stacked with `schema.extend`. The policy is data:
  `MediaType` rows (`extension`, `type`, one extension per type) in the level `QtiMediaPolicy`, which an application
  writes. `Attribute` gains three generated columns its laws read (`data_scheme`, `data_token`, `style_fetch`).
- `importRowsOf(pkg)` (`import/program.ts`) returns `{ insert, packageId }` for `importWrite`, so an application
  writes a package with its own `Db`. `importPackage` stays, built on it.
- `migrationConnection`, `loginConnection` and `primedLoginConnection` (`db/connection.ts`), and `ImportLive` and
  `AuthorAppLayer` (`db/layer.ts`), are no longer exported: the `"exports"` map lists neither module, which the
  command line and the tests alone import. `connectionServices`, `servedPathOf`, `QtiInstall`, `installFolder`,
  `readInstall`, `InstallPolicyError` and `installedPolicy` are deleted, and `QTI_PIE_QTI_INSTALL` is read nowhere.
- `db/install.ts` holds only the media policy file's schema: `MediaExtension`, `MediaType`, `MediaPolicySchema` and
  `MediaPolicy`; an extension is at most 127 characters.
- New exports: `qti/media.ts`, `import/program.ts`, `import/refusal.ts`, `vocab/laws.ts` and `db/served.ts`
  (`AuthorLogin`). `"sideEffects": false`.
- One migration, regenerated from zero: `migrations/qti/<timestamp>_sterling-standard`.
- New export: `documentScanOf(document)` (`export/scan.ts`), `documentScan`'s arms over a document term an
  application's attachment mints, unpaged: `.attach("document", (served) => documentScanOf(served.item), "array")`.
  `documentScan`'s served SQL is unchanged.
