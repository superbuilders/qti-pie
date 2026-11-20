/**
 * The `Qti` schema: its stored level, `QtiBase` (`#pantry/qti/base.ts`), every roster, closed
 * relation and stored relation with the laws over them; over it the level `QtiViews`
 * (`#pantry/qti/names.ts`), the one home of the shared views every rule over a query reads, its
 * name views the one definition of what a declared name names, which every rule that resolves a
 * name matches; and over that the level `QtiQueries`, which names the queries its
 * rules read, with those rules (`#pantry/qti/queries.ts`). The three levels are one installation,
 * under the stored level's name: grizzle installs each level in a PostgreSQL
 * schema of its own, the stored level's holding every table, and judges a rule over a query by
 * deferred triggers on the tables below it (README, "Levels").
 *
 * Every reader of the schema, the author role, its login and the importer among them, reads `Qti`,
 * the top level, so a refusal by a rule over a query is its own law, never a law of a level above.
 * An application that adds laws or relations of its own stacks its level over `Qti` with grizzle's
 * `schema.extend`, as `#pantry/qti/media.ts` does for the package-media laws.
 */
import { schema } from "@bjornpagen/grizzle";
import { QtiViews } from "#pantry/qti/names.ts";
import { queryLaws, queryRelations } from "#pantry/qti/queries.ts";

/**
 * The QTI 3.0 schema: every relation of `QtiBase`, every shared view of `QtiViews` and every query
 * of `QtiQueries`, each public and typed under `Qti.relations`, and every law over them.
 */
export const Qti = schema.extend(QtiViews, "QtiQueries", queryRelations, queryLaws);
