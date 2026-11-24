/**
 * The author role: the one world qti-pie opens, holding every stored relation of `Qti` whole and
 * inserting into every one of them. Every relation of `Qti` is closed, so a write is an insert,
 * never an update or a delete: a package is published whole (`insertWrite` of
 * `#pantry/qti/logins.ts`) and never changed or removed.
 */
import { role, wholeEntriesOf, wholeWritesOf } from "@bjornpagen/grizzle";
import { Qti } from "#pantry/qti/schema.ts";

/**
 * The author role over `Qti`: a full role, holding every stored relation, every roster and every
 * stored derived relation whole and writing every stored relation. Its entries are grizzle's
 * `wholeEntriesOf`, which leaves out the closed relations, no role's entries: every law that reads
 * one is the schema's, and holds whoever writes. A roster has no view, and every query reads its
 * handles as codes. A stored derived relation is a table grizzle keeps, which no role writes. Its
 * writes are `wholeWritesOf`, each stored relation under the mode `Qti` declares it in: every one
 * is closed, so its insert list names them all, and the role holds SELECT and INSERT on them and no
 * UPDATE or DELETE: a direct UPDATE or DELETE through the role is 42501.
 *
 * Grizzle puts a role in one login only: the author login holds this one (`#pantry/qti/logins.ts`
 * `AuthorApp`). An application that writes content beside rows of its own in one transaction
 * declares its own role over its own level, `authorWrites` of `#pantry/qti/logins.ts` spread into
 * its insert and write lists beside its own relations.
 */
export const Author = role(Qti, "author", wholeEntriesOf(Qti), wholeWritesOf(Qti));

/**
 * The author role, the type of {@link Author}.
 */
export type AuthorRole = typeof Author;
