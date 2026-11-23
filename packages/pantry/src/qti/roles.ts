/**
 * The author role: the one world qti-pie opens, holding every stored relation of `Qti` whole and
 * inserting into every one of them. Every relation of `Qti` is closed, so a write is an insert,
 * never an update or a delete: a package is published whole (`insertWrite` of
 * `#pantry/qti/logins.ts`) and never changed or removed.
 */
import { role, wholeEntriesOf, writableNamesOf } from "@bjornpagen/grizzle";
import { Qti } from "#pantry/qti/schema.ts";

/**
 * The author role over `Qti`: a full role, holding every stored relation and every roster whole and
 * writing every stored relation. Its entries are grizzle's `wholeEntriesOf`, which leaves out the
 * closed relations, no role's entries: every law that reads one is the schema's, and holds whoever
 * writes. A roster has no view, and every query reads its handles as codes. Its insert list is
 * `writableNamesOf`, the stored relations in the schema's order, so the role holds SELECT and
 * INSERT on them, and no UPDATE or DELETE: a direct UPDATE or DELETE through the role is 42501.
 *
 * Grizzle puts a role in one login only: the author login holds this one (`#pantry/qti/logins.ts`
 * `AuthorApp`). An application that writes content beside rows of its own in one transaction
 * declares its own role over its own level, its write list `authorWrites` of
 * `#pantry/qti/logins.ts` beside its own relations, in its insert list.
 */
export const Author = role(Qti, "author", wholeEntriesOf(Qti), { insert: writableNamesOf(Qti) });

/**
 * The author role, the type of {@link Author}.
 */
export type AuthorRole = typeof Author;
