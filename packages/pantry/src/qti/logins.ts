/**
 * The author application's login, the import's write programs, and the author login's reads, plain
 * grizzle values over `Qti`: an application's grizzle config lists {@link AuthorApp} beside its own
 * logins, or puts {@link insertWrite}, {@link removeWrite} and the reads ({@link authorReads}) in a
 * workload of a role of its own, a role that writes {@link authorWrites}.
 *
 * A package is published whole or removed whole, never changed in place: its name is one revision
 * for as long as it stands, so `(package, item)` names the exact tree a child was served, in every
 * install, never only in one that happens to serve no replacing login. The publish
 * ({@link insertWrite}) is declared with no rows, an empty array for each relation an import
 * inserts, so each insert is an array member that takes a package's rows with each call; the
 * removal ({@link removeWrite}) deletes each top relation's rows of one package by its `package`
 * ({@link byPackage}). grizzle compiles both wherever it compiles a workload: `grizzle generate`,
 * which writes the compiled login as the served file (`migrations/qti/served/author_app.json` for
 * this package's own), and `grizzle check`, which compiles it again and holds the file to it. A
 * schema whose writes cannot compile then fails there, never at the first import (R87, whose one
 * unfilled field made every import's ChangeSet refuse once a migrated schema ran it). A process
 * serves that file and compiles nothing: it applies the served `insertWrite` member to each
 * package's rows (`importRowsOf` of `#pantry/import/program.ts`; the W5 amendment's C19).
 */
import { ChangeSet, insertableNamesOf, login, paged, param, workload } from "@bjornpagen/grizzle";
import { pipe, Record as Rec, Struct } from "effect";
import { documentScan, entriesOf } from "#pantry/export/scan.ts";
import type { WrittenName } from "#pantry/import/roster.ts";
import { packageFactsOf } from "#pantry/import/write.ts";
import { PackageName } from "#pantry/qti/limits.ts";
import { Author } from "#pantry/qti/roles.ts";
import { Qti } from "#pantry/qti/schema.ts";

/**
 * The rows of a package, its delete's selection in {@link removeWrite}: the rows whose `package`
 * is the package's name, its parameter `package`.
 */
const byPackage = { package: param("package", PackageName) } as const;

/**
 * The relations a ChangeSet over `Qti` writes, the `Writes` of grizzle's `ChangeSet` type: each
 * relation its members name, and every relation a whole delete reaches through the families of the
 * relation it names.
 */
type WritesOf<C> =
  C extends ChangeSet<typeof Qti, infer _Params, infer Writes, infer _Reads> ? Writes : never;

/**
 * The relations an import writes that a ChangeSet's deletes leave as they are: each relation an
 * import writes but `Package`, which a removal names by its key, that the ChangeSet does not write.
 */
type Undeleted<C> = Exclude<WrittenName, WritesOf<C> | "Package">;

/**
 * Hold a ChangeSet of deletes to reach every relation an import writes but `Package`, so a removal
 * leaves no stored row of the package: a top relation whose delete is missing fails to compile
 * here, naming the relation (`undeleted`). The deletes reach a family's members through its owner,
 * so a relation listed nowhere in the chain is reached where its owner is deleted, and nowhere
 * else.
 *
 * @param deletes - The deletes.
 * @returns The deletes.
 */
const deletingEvery = <C>(
  deletes: C & ([Undeleted<C>] extends [never] ? unknown : { readonly undeleted: Undeleted<C> }),
): C => deletes;

/**
 * Every top relation of one package, each by its `package` ({@link byPackage}), in the order of the
 * relations' names: {@link removeWrite}'s deletes. A tree, `Node`, is deleted whole by its root
 * field, and every other relation by its rows; a delete of a family's owner removes every row
 * nested under it, through every family, so no family's member is listed: `Instance`, a tree whose
 * nodes are the members of `TestDocument.instances`, goes with its `TestDocument`. `Package` is not
 * listed: a removal names it by its key.
 */
const packageRows = {
  AssembledCatalog: byPackage,
  AttributeEntity: byPackage,
  BoundVariable: byPackage,
  CandidatePath: byPackage,
  CatalogId: byPackage,
  CatalogScope: byPackage,
  CellHeaders: byPackage,
  CnAttribute: byPackage,
  CnCount: byPackage,
  Comment: byPackage,
  ContextRef: byPackage,
  CountBound: byPackage,
  DataSsml: byPackage,
  DataSsmlMember: byPackage,
  DataSsmlProperty: byPackage,
  Doctype: byPackage,
  Document: byPackage,
  ElementType: byPackage,
  EncodingDecl: byPackage,
  Entry: byPackage,
  Expression: byPackage,
  FeedbackRef: byPackage,
  File: byPackage,
  FragmentScope: byPackage,
  IdentityText: byPackage,
  Inclusion: byPackage,
  Interaction: byPackage,
  InteractionAttribute: byPackage,
  ItemMode: byPackage,
  ItemRefDocument: byPackage,
  ItemRefHref: byPackage,
  LabelUse: byPackage,
  LeastCount: byPackage,
  Literal: byPackage,
  LiteralTyped: byPackage,
  LookupValue: byPackage,
  MapKey: byPackage,
  MasteryValue: byPackage,
  MathAction: byPackage,
  MathAlignScope: byPackage,
  MathCell: byPackage,
  MathCn: byPackage,
  MathRank: byPackage,
  Media: byPackage,
  MostCount: byPackage,
  Named: byPackage,
  Namespace: byPackage,
  Node: byPackage,
  NormalMaximum: byPackage,
  NormalMinimum: byPackage,
  OpenAttributeEntity: byPackage,
  OpenElementName: byPackage,
  OpenElementType: byPackage,
  Pi: byPackage,
  PlacedMathRank: byPackage,
  PrintedVariableRef: byPackage,
  Processing: byPackage,
  Reference: byPackage,
  ReferencePath: byPackage,
  ReferringDocument: byPackage,
  ResourceDocument: byPackage,
  ResourceHref: byPackage,
  Rounding: byPackage,
  RoundingFigures: byPackage,
  RoundingModeFigures: byPackage,
  SdDecl: byPackage,
  ShareFragment: byPackage,
  ShareTarget: byPackage,
  Site: byPackage,
  SitePath: byPackage,
  Srcset: byPackage,
  SsmlScope: byPackage,
  StimulusRef: byPackage,
  TableHeader: byPackage,
  TableScope: byPackage,
  TemplateRef: byPackage,
  TestDocument: byPackage,
  TextReference: byPackage,
  TextReferencePath: byPackage,
  Tolerance: byPackage,
  UsageValue: byPackage,
  UsageValueBaseType: byPackage,
  VariableRefTable: byPackage,
  XmlDecl: byPackage,
} as const;

/**
 * Each relation an import writes (grizzle's `insertableNamesOf`), inserted once by its key with no
 * row (`insertAll`, which types and checks each key's rows as that relation's own insert), every
 * owner in the same stratum as its whole family (the W5 amendment's A, C19): {@link insertWrite}'s
 * inserts.
 */
// GRIZZLE-PENDING: Q2: the rowless ChangeSet builder declares these inserts by relation name with no rows.
const packageInserts = packageFactsOf(
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
 * in it, and every relation of `Qti` is immutable. A package under a name no package holds is
 * inserted whole (`accepted`); the same package again under its name is `unchanged`, so a write
 * whose commit got no answer is settled by running it again; and another package under a stored
 * name meets `Package`'s key and the keys the two share, and is refused, so nothing stored is ever
 * replaced in place: a replace in one transaction that kept an item's identifier would pass a
 * ledger's containment, deferred to COMMIT, and change the tree under a session it recorded. Two
 * packages that share a manifest identifier under two names are two packages.
 *
 * It is over the schema, so a workload of any role that writes every relation of `Qti` holds it,
 * the author role's ({@link AuthorApp}) or an application's own. An application that writes rows of
 * its own in the same transaction applies the union of this and its own ChangeSet
 * (`ChangeSet.union(insertWrite, its own)`), through a role that writes {@link authorWrites}.
 */
export const insertWrite = ChangeSet.empty(Qti).insertAll(packageInserts);

/**
 * The removal of one whole package, its `Package` row included: every relation of
 * {@link packageRows} and `Package` by its key, the name its parameter `package` gives, which
 * {@link deletingEvery} holds to reach every relation an import writes. A level above `Qti` whose
 * rows a package's content holds by foreign key refuses the removal of a package they name, so a
 * package a child was served stays.
 */
export const removeWrite = deletingEvery(
  ChangeSet.empty(Qti).deleteWhere({
    ...packageRows,
    Package: { name: param("package", PackageName) },
  }),
);

/**
 * The relations the author role writes, by name ({@link Author}): every stored relation of `Qti`,
 * each inserted into and deleted from, none updated. An application whose own role over its level
 * writes content beside rows of its own, in one transaction and under one login
 * ({@link insertWrite}), lists these in its role's write list beside its own relations.
 */
export const authorWrites = Author.write;

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
 * - **the import's write programs**: {@link insertWrite}, every insert an array member, and
 *   {@link removeWrite}, its deletes selected by a parameter. grizzle compiles a ChangeSet from its
 *   Description, which names each delete's relation and parameter and each insert, and none of its
 *   rows, so these are the programs every package's import and removal apply, compiled once into
 *   the served file. Compiling them also guards the refusals of the write programs themselves: the
 *   schema's own compile already refuses a column or a relation no write fills, and this one
 *   refuses a write outside the author role (`OutsideRole`), a stratum no order of its statements
 *   keeps every key at (`UnorderableStratum`), and a delete that leaves a family's group partial.
 *
 * Its name is the one every earlier installation used, so a migration from scratch needs no
 * `--rename @…`. Where it is installed, its PostgreSQL role is the one grizzle's `roleNameOf` gives
 * it. A login over `Qti` is a login of any installation whose levels include `Qti`, so an
 * application that stacks a level over `Qti` (`#pantry/qti/media.ts`) lists it as it is.
 *
 * @see https://github.com/bjornpagen/grizzle/blob/eb56d58bb3191b6645f1334dc55f63c7a73c2dc4/packages/engine/src/program/names.ts#L61-L76
 */
export const AuthorApp = login(Qti, "author_app", [Author], {
  workload: [workload(Author, authorReads), workload(Author, { insertWrite, removeWrite })],
});

/**
 * The author application's login, the type of {@link AuthorApp}: the type the runtime serves the
 * login's committed workload as (`#pantry/db/served.ts`), read by `import type` alone.
 */
export type AuthorAppLogin = typeof AuthorApp;
