/**
 * The importer's front door: a package as `readPackage` read it (`#pantry/import/read.ts`) in, the
 * package stored under the name its caller gave it out, or one named refusal (plan W5, Q5.15; the
 * W5 amendment's A, C19 and C22).
 *
 * The read package is built into its rows once (`importRowsOf` of `#pantry/import/program.ts`, the
 * rows an application writes itself with its own grizzle `Db` where it needs the package in a
 * transaction of its own), its directory never read again. Its media files' bytes are put in the
 * content-addressed store first (`MediaStore` of `#pantry/package/media.ts`), each under the
 * SHA-256 its `Media` row states, so no stored row names bytes the store lacks; then the rows are
 * written by the author login's `insertWrite` member, the one ChangeSet step
 * (`#pantry/qti/logins.ts`) that `grizzle generate` compiled into the login's served file, applied
 * once to those rows. The caller passes its own `Db`'s workload, of any login whose workload serves
 * `insertWrite` (grizzle's `MemberHandle`): `AuthorApp`'s over `Qti` and `MediaAuthorApp`'s over
 * `QtiMedia` alike. This module is a convenience over that one apply, made once: it names a
 * refusal's QTI rules, and every other failure is the call's own typed `CallError`.
 *
 * The write only inserts, and every row is keyed by the package's name, so a package under a new
 * name is inserted whole, the same package again under its name is grizzle's `unchanged`, and
 * another package under a stored name is refused on the keys the two share: nothing stored is ever
 * replaced, and nothing is minted. So a commit with no answer, which fails the import with
 * grizzle's `commitUnknown`, is settled by importing the package again, which answers whether the
 * database holds it: `unchanged` where it committed, `accepted` where it did not and now has. No
 * retry lives here: a retry belongs to den's durable steps or the platform's redelivery. Two
 * packages that share a manifest identifier are two packages under two names. The apply is one
 * transaction, so the database holds the whole package or nothing of it: there is no split and no
 * completion marker. grizzle writes each relation's rows in one statement, its nested rows past one
 * Bind message through a carrier, a temporary table of the write's own (README, "Sizes"; grizzle
 * `164aeb06`), so no transport bound splits the write.
 */
import type { CallError, MemberHandle } from "@bjornpagen/grizzle";
import { Context, Duration, Effect } from "effect";
import { importRowsOf } from "#pantry/import/program.ts";
import type { QtiPackage } from "#pantry/import/read.ts";
import { lawsOfRefusal, refusalOf } from "#pantry/import/refusal.ts";
import type { ImportRefused } from "#pantry/import/rules.ts";
import { MediaStore } from "#pantry/package/media.ts";
import type { MediaUnstored } from "#pantry/package/media.ts";
import type { insertWrite } from "#pantry/qti/logins.ts";

/**
 * What runs each attempt of the import's apply: by default the attempt as it is, so a caller
 * provides nothing. A wrap runs as each attempt starts, so it marks the moment the import's
 * database write begins: the command line's wraps the attempt it is given in one that first records
 * how a stop by `--timeout` from then on is settled (`#pantry/cli/settle.ts` `settlingWrite`),
 * since grizzle's README says an interrupted write may have committed. A test provides a wrap
 * through `Effect.provideService` to inject a failure the cluster will not raise on demand (a
 * `transient` call error, a `commitUnknown` before or after the apply ran, an interruption while it
 * waits on a lock), and the import then meets that failure as it would meet the database's.
 */
export const WrapApply = Context.Reference<
  <A>(apply: Effect.Effect<A, CallError>) => Effect.Effect<A, CallError>
>("pantry/import/package/WrapApply", { defaultValue: () => (apply) => apply });

/**
 * The refusal a `refused` call error names, read from it alone (`refusalOf`): how grizzle decided
 * its laws (`refused.kind`), every law it names with the set of their rules, and grizzle's witness.
 * `every` names the laws grizzle judged broken; `first` the laws of the CHECK PostgreSQL tried
 * first, which the row may not be alone in breaking; `some` the laws one PostgreSQL object
 * discharges, at least one of them broken and nothing deciding which. The import judges no law and
 * reads no row of its own to decide more than grizzle did, so a `some` or `first` refusal stays
 * under every rule its laws carry. The witness is the key of the first stated row that breaks a
 * law, or `unreported` for a foreign key and for a law no stated row breaks as grizzle's host
 * judges it. A law no row of the law table names still prints its text, and carries no rule.
 * Naming the laws reads the entries the laws carry alone, which compiles nothing, and that step has
 * a span of its own, which records the laws it named and their rules.
 *
 * @param error - The apply's `refused` call error.
 * @returns Fails with the `ImportRefused` it names.
 */
const nameRefusal = ({
  refused,
  witness,
}: Extract<CallError, { readonly kind: "refused" }>): Effect.Effect<never, ImportRefused> =>
  Effect.sync(() => refusalOf(refused, witness)).pipe(
    Effect.tap((built) =>
      Effect.annotateCurrentSpan({
        lawsNamed: lawsOfRefusal(refused).length,
        refusedKind: refused.kind,
        rules: built.rules.join("|"),
      }),
    ),
    Effect.withSpan("import.nameRefusal"),
    Effect.flatMap((refusal) => Effect.fail(refusal)),
  );

/**
 * What an import did, under the package's name: stored a package under a name the database did not
 * hold (`accepted`), or found the database holding it already, the same rows under its name
 * (`unchanged`), which a write whose first commit got no answer and committed finds too.
 */
export interface Imported {
  readonly outcome: "accepted" | "unchanged";
  readonly package: QtiPackage["name"];
}

/**
 * Import a package `readPackage` read under its name, through a `Db`'s workload, `db.workload` of
 * any author login, and the content-addressed store its media files' bytes go to.
 *
 * Builds every row from the package's documents and files, reading nothing of its directory and
 * minting nothing, puts every media file's bytes in the store under the digest its `Media` row
 * states, then applies the rows as one ChangeSet through the workload's `insertWrite`. The name is
 * the one `readPackage` was given: a package under a name no package holds is `accepted`; the same
 * package again under its name is `unchanged`; another package under a stored name is refused on
 * the keys the two share, `ImportRefused` naming them, since a name is one revision for as long as
 * it stands. The apply is made once: a transient refusal, which changed nothing, fails the import
 * with grizzle's `transient` `CallError`, and a commit with no answer fails it with
 * `commitUnknown`; importing the package again is the caller's, and answers `unchanged` where that
 * commit landed, since the write only inserts. Its member is grizzle's `MemberHandle` of the
 * program the login serves, so the handle of either author login is one, `AuthorApp`'s over `Qti`
 * and `MediaAuthorApp`'s over `QtiMedia`. Each attempt of the apply runs through {@link WrapApply},
 * a reference whose default is the live one, so a caller provides nothing.
 *
 * @param workload - The author `Db`'s workload: its `insertWrite` member.
 * @param pkg - The package, as `readPackage` read it under its name.
 * @returns The package's name and what the import did. Fails with `MediaUnstored` when the store
 *   refuses a media file's bytes, before anything is written to the database; with `ImportRefused`
 *   naming the rules the database refused the package under; and with grizzle's own error when the
 *   database failed for a reason that is not a refusal.
 */
export const importPackage = Effect.fn("import.importPackage")(function* importPackage(
  workload: { readonly insertWrite: MemberHandle<typeof insertWrite> },
  pkg: QtiPackage,
): Effect.fn.Return<Imported, ImportRefused | CallError | MediaUnstored, MediaStore> {
  const wrap = yield* WrapApply;
  const store = yield* MediaStore;
  const rows = yield* importRowsOf(pkg);
  const name = rows.package;

  yield* Effect.forEach(rows.media, ({ bytes, digest }) => store.put(digest, bytes), {
    concurrency: "unbounded",
    discard: true,
  });

  const [elapsed, outcome] = yield* wrap(
    workload.insertWrite.once({ facts: { insert: rows.insert }, params: {} }),
  ).pipe(
    Effect.catch((error): Effect.Effect<never, ImportRefused | CallError> =>
      error.kind === "refused" ? nameRefusal(error) : Effect.fail(error),
    ),
    Effect.timed,
  );

  yield* Effect.annotateCurrentSpan({
    applyMillis: Duration.toMillis(elapsed),
    media: rows.media.length,
    outcome: outcome.kind,
    package: name,
  });

  if (outcome.kind === "accepted") {
    yield* Effect.logDebug(
      "import applied",
      Object.fromEntries(outcome.counts.map((c) => [c.relation, `+${c.added}`] as const)),
    );
  }

  return { outcome: outcome.kind, package: name };
});
