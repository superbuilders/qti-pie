/**
 * A package applied through the author login as the database tests apply one: its import program
 * read, one edit of its inputs, and the login's `insertWrite` member called on its facts, its
 * refusal by the schema's laws an answer beside its outcome; and the laws a refusal is matched
 * against. A test judges its own package by its manifest identifier
 * ({@link packageStored}), never by a count of every stored package, so it holds beside another
 * file's imports.
 */
import { Db } from "@bjornpagen/grizzle/runtime";
import type { Law } from "@bjornpagen/grizzle";
import type { CallError, WriteOutcome } from "@bjornpagen/grizzle/runtime";
import { Duration, Effect } from "effect";
import { AuthorLogin } from "#pantry/db/served.ts";
import { readProgram } from "#pantry/import/program.ts";
import { lawsOfRefusal } from "#pantry/import/refusal.ts";
import { writtenFactsOf } from "#pantry/import/write.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import type { QtiPackage } from "#pantry/import/read.ts";
import { nameOf } from "#pantry/test/package-name.ts";

/**
 * What applying a package answers: grizzle's outcome of the write, or the `refused` call error the
 * schema's laws refused it with.
 */
export type Applied = WriteOutcome<unknown> | Extract<CallError, { readonly kind: "refused" }>;

/**
 * Build a package's ChangeSet with one edit of its inputs and apply it, logging the apply's time.
 *
 * @param dir - The package.
 * @param edit - The edit of its inputs; none applies the package as read.
 * @returns The apply's outcome or its refusal, and the package's name, its directory's base name
 *   (`nameOf`).
 */
export const applyEdited = (
  dir: string,
  edit: (inputs: PackageInputs) => PackageInputs = (held) => held,
) =>
  Effect.gen(function* appliesEdited() {
    const name = nameOf(dir);
    const program = yield* readProgram(dir, name);
    const db = yield* Db.open((yield* AuthorLogin).roles.author, {});
    const [applied, outcome] = yield* Effect.timed(
      db.workload.insertWrite
        .once({
          facts: { insert: writtenFactsOf(edit(program.inputs)) },
          params: { package: name },
        })
        .pipe(
          Effect.catchIf(
            (error): error is Extract<CallError, { readonly kind: "refused" }> =>
              error.kind === "refused",
            (refusal): Effect.Effect<Applied> => Effect.succeed(refusal),
          ),
        ),
    );

    yield* Effect.log("import apply", { applyMillis: Duration.toMillis(applied), dir });

    return { outcome, package: program.package };
  });

/**
 * Whether a package is stored, read back by its name through the author login's `packageOf`.
 *
 * @param name - The package's name.
 * @returns Whether its row is stored.
 */
export const packageStored = (name: QtiPackage["name"]) =>
  Effect.gen(function* storedByName() {
    const db = yield* Db.open((yield* AuthorLogin).roles.author, {});

    return (yield* db.workload.packageOf.once({ facts: {}, params: { package: name } })).size > 0;
  });

/**
 * Pick a check of one relation by its name.
 *
 * @param relation - The relation.
 * @param name - The check's name.
 * @returns The predicate.
 */
export const checkNamed =
  (relation: string, name: string) =>
  (law: Law): boolean =>
    law.kind === "check" && law.relation === relation && law.name === name;

/**
 * Pick a key by its relation and the fields it reads, in order.
 *
 * @param relation - The relation.
 * @param fields - The key's fields.
 * @returns The predicate.
 */
export const keyOn =
  (relation: string, ...fields: readonly string[]) =>
  (law: Law): boolean =>
    law.kind === "key" &&
    law.side.relation === relation &&
    law.side.terms.map(({ field }) => field).join(" ") === fields.join(" ");

/**
 * Whether an apply was `refused` with a law among the laws it names ({@link lawsOfRefusal}: its own
 * laws, or an `above` refusal's laws above and then its own) one of the predicates picks.
 *
 * @param outcome - The apply's outcome or refusal.
 * @param picks - The laws the case may be refused under.
 * @returns Whether it is.
 */
export const rejectedBy = (outcome: Applied, picks: readonly ((law: Law) => boolean)[]): boolean =>
  outcome.kind === "refused" &&
  lawsOfRefusal(outcome.refused).some(({ law }) => picks.some((pick) => pick(law)));
