/**
 * The author application's login, the import's write program, and the author login's reads, plain
 * grizzle values over `Qti`: an application's grizzle config lists {@link AuthorApp} beside its own
 * logins, or puts {@link insertWrite} and the reads ({@link authorReads}) in a workload of a role
 * of its own, a role that writes {@link authorWrites} by their modes.
 *
 * A package is published whole and never changed or removed: every relation of `Qti` is closed, so
 * its name is one revision forever, `(package, item)` names the exact tree a child was served in
 * every install, and a fix is a package of its own under a new name, beside the old one, which
 * stays as history (Bjorn, 2026-11-23: "closed = never changed or deleted"). The publish
 * ({@link insertWrite}) is declared with no rows, an empty array for each relation an import
 * inserts, so each insert is an array member that takes a package's rows with each call. grizzle
 * compiles it wherever it compiles a workload: `grizzle generate`, which writes the compiled login
 * as the served file (`migrations/qti/served/author_app.json` for this package's own), and `grizzle
 * check`, which compiles it again and holds the file to it. A schema whose writes cannot compile
 * then fails there, never at the first import (R87, whose one unfilled field made every import's
 * ChangeSet refuse once a migrated schema ran it). A process serves that file and compiles nothing:
 * it applies the served `insertWrite` member to each package's rows (`importRowsOf` of
 * `#pantry/import/program.ts`; the W5 amendment's C19).
 */
import { ChangeSet, insertableNamesOf, login, paged, param, workload } from "@bjornpagen/grizzle";
import { pipe, Record as Rec, Struct } from "effect";
import { documentScan, entriesOf } from "#pantry/export/scan.ts";
import { writtenFactsOf } from "#pantry/import/write.ts";
import { PackageName } from "#pantry/qti/limits.ts";
import { Author } from "#pantry/qti/roles.ts";
import { Qti } from "#pantry/qti/schema.ts";

/**
 * Each relation an import writes (grizzle's `insertableNamesOf`), inserted once by its key with no
 * row (`insertAll`, which types and checks each key's rows as that relation's own insert), every
 * owner in the same stratum as its whole family (the W5 amendment's A, C19): {@link insertWrite}'s
 * inserts.
 */
// GRIZZLE-PENDING: Q2: the rowless ChangeSet builder declares these inserts by relation name with no rows.
const packageInserts = writtenFactsOf(
  pipe(
    Struct.pick(Qti.relations, insertableNamesOf(Qti)),
    Rec.map(() => new Map<string, never>()),
  ),
);

/**
 * The publish of one package under its name, the import's write program, insert-only:
 * {@link packageInserts} and no delete, so a role that holds only INSERT on `Qti` (grizzle's
 * `insert` option) runs it, and a package's name is one revision forever. Each import applies it to
 * its own package's rows, `db.workload.insertWrite.once({ facts: { insert: rows.insert }, params:
 * {} })`, the rows `importRowsOf` builds (`#pantry/import/program.ts`).
 *
 * Every row is keyed by the package's name, which its caller gives it, and the paths and positions
 * in it, and every relation of `Qti` is closed. A package under a name no package holds is
 * inserted whole (`accepted`); the same package again under its name is `unchanged`, so a write
 * whose commit got no answer is settled by running it again; and another package under a stored
 * name meets `Package`'s key and the keys the two share, and is refused, so nothing stored is ever
 * replaced in place: a replace in one transaction that kept an item's identifier would pass a
 * ledger's containment, deferred to COMMIT, and change the tree under a session it recorded. Two
 * packages that share a manifest identifier under two names are two packages.
 *
 * It is over the schema, so a workload of any role that inserts every relation of `Qti` holds it,
 * the author role's ({@link AuthorApp}) or an application's own. An application that writes rows of
 * its own in the same transaction applies the union of this and its own ChangeSet
 * (`ChangeSet.union(insertWrite, its own)`), through a role that writes {@link authorWrites}.
 */
export const insertWrite = ChangeSet.empty(Qti).insertAllComputed(packageInserts, {
  package: param("package", PackageName),
});

/**
 * The relations the author role writes, by name and by the mode it writes each by ({@link Author}):
 * every stored relation of `Qti`, each closed, so under `insert`, only inserted into, never updated
 * or deleted from. An application whose own role over its level writes content beside rows of its
 * own, in one transaction and under one login ({@link insertWrite}), spreads each list into its
 * role's list of the same mode beside its own relations.
 */
export const authorWrites = { insert: Author.insert, write: Author.write } as const;

/**
 * The author login's reads, as its first workload holds them, the export's: one document's ordered
 * scan and a package's entries with each entry's document or media digest
 * (`#pantry/export/scan.ts`), and `packageOf`, the `Package` row by its key, its name. Each is over
 * `Qti`, so a workload of any author role holds them.
 */
export const authorReads = {
  documentScan: paged(documentScan),
  entriesOf,
  packageOf: Qti.relations.Package,
} as const;

/**
 * The author application's login over `Qti`, over its author role (`#pantry/qti/roles.ts`
 * `Author`), with two workloads:
 *
 * - **the reads** ({@link authorReads}): one document's ordered scan and a package's entries with
 *   each entry's document or media digest, each compiled by `grizzle generate` into the login's
 *   served file, its access paths earning their indexes (the W5 amendment's C20); and `packageOf`,
 *   the `Package` row by its name, a key member whose handle's `get` the export reads to refuse a
 *   name no package has, so every read pantry runs is a member of the workload;
 * - **the import's write program**: {@link insertWrite}, every insert an array member. grizzle
 *   compiles a ChangeSet from its Description, which names each insert and none of its rows, so it
 *   is the program every package's import applies, compiled once into the served file. Compiling it
 *   also guards the refusals of the write program itself: the schema's own compile already refuses
 *   a column or a relation no write fills, and this one refuses a write outside the author role
 *   (`OutsideRole`, an update or a delete among them) and a stratum no order of its statements
 *   keeps every key at (`UnorderableStratum`).
 *
 * Its name is the one every earlier installation used, so a migration from scratch needs no
 * `--rename @…`. Where it is installed, its PostgreSQL role is the one grizzle's `roleNameOf` gives
 * it. A login over `Qti` is a login of any installation whose levels include `Qti`, so an
 * application that stacks a level over `Qti` (`#pantry/qti/media.ts`) lists it as it is.
 *
 * @see https://github.com/bjornpagen/grizzle/blob/eb56d58bb3191b6645f1334dc55f63c7a73c2dc4/packages/engine/src/program/names.ts#L61-L76
 */
export const AuthorApp = login(Qti, "author_app", [Author], {
  workload: [workload(Author, authorReads), workload(Author, { insertWrite })],
});

/**
 * The author application's login, the type of {@link AuthorApp}: the type the runtime serves the
 * login's committed workload as (`#pantry/db/served.ts`), read by `import type` alone.
 */
export type AuthorAppLogin = typeof AuthorApp;
